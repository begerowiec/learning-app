/**
 * The application controller.
 *
 * One hook owns navigation, preferences, the in-flight session and the derived
 * view models; screens receive it as a single `app` prop and stay presentational.
 * It is the seam between React and `core`: every mutation goes through
 * `ProgressService` / `LearningService`, and React state only ever holds the
 * snapshots they return.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { HomeView, SubjectView } from '@core/LearningService.ts';
import type { Language, Level, Subject } from '@core/domain/schema.ts';
import { track } from '@core/analytics/analytics.ts';
import {
  backupFilename,
  parseBackup,
  serializeBackup,
  type BackupProblem,
  type BackupSummary,
} from '@core/progress/backup.ts';
import type { StorageDiagnostics } from '@core/progress/DurableProgressStore.ts';
import type { ProgressState, UserPreferences } from '@core/progress/models.ts';
import { isSelfGraded } from '@core/session/grading.ts';
import {
  advance,
  checkAnswer,
  currentItem,
  flipCard as flipCardState,
  selectOption as selectOptionState,
  sessionSummary,
  startSession,
  type SessionState,
} from '@core/session/sessionEngine.ts';
import type { TabName } from '@ui/components/index.ts';
import { createTranslator, type Translator } from '@ui/i18n/index.ts';
import { routeForTab, tabForRoute, type Route } from './routes.ts';
import { createServices, type Services } from './services.ts';

export interface SummaryView {
  kind: 'lesson' | 'review';
  kicker: string;
  title: string;
  correct: number;
  total: number;
  accuracy: number;
  durationSeconds: number;
  practised: string[];
  weak: string[];
}

/** What came of an attempted restore, in a form the Profile screen can show. */
export type ImportOutcome =
  | { ok: true; summary: BackupSummary }
  | { ok: false; problem: BackupProblem };

export interface AppController extends Translator {
  services: Services;
  route: Route;
  tab: TabName;
  theme: 'light' | 'dark';
  preferences: UserPreferences;
  progressState: ProgressState;
  allSubjects: Subject[];
  subjectViews: SubjectView[];
  home: HomeView | null;
  session: SessionState | null;
  summary: SummaryView | null;
  loading: boolean;

  go: (route: Route) => void;
  goTab: (tab: TabName) => void;
  back: () => void;

  toggleSubject: (subjectId: string) => void;
  setLevel: (subjectId: string, level: Level) => void;
  setDailyGoal: (minutes: number) => void;
  completeOnboarding: () => void;
  restartOnboarding: () => void;

  setTheme: (theme: 'light' | 'dark') => void;
  setReminders: (enabled: boolean) => void;
  setInterfaceLanguage: (language: Language) => void;
  setContentLanguage: (language: Language) => void;
  resetProgress: () => void;

  startLesson: (lessonId: string) => void;
  startReview: () => void;

  storage: StorageDiagnostics;
  exportBackup: () => void;
  importBackup: (text: string) => ImportOutcome;

  selectOption: (optionId: string) => void;
  flipCard: () => void;
  submit: () => void;
  answerFlashcard: (remembered: boolean) => void;
  exitSession: () => void;
}

export function useAppController(): AppController {
  const services = useMemo(() => createServices(), []);
  const { progress, learning } = services;

  const [preferences, setPreferences] = useState<UserPreferences>(() => progress.getPreferences());
  const [progressState, setProgressState] = useState<ProgressState>(() => progress.getState());
  const [route, setRoute] = useState<Route>(() =>
    progress.getPreferences().onboarded ? { name: 'home' } : { name: 'onboarding-subjects' },
  );
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [subjectViews, setSubjectViews] = useState<SubjectView[]>([]);
  const [home, setHome] = useState<HomeView | null>(null);
  const [session, setSession] = useState<SessionState | null>(null);
  const [summary, setSummary] = useState<SummaryView | null>(null);
  const [loading, setLoading] = useState(true);
  const [storage, setStorage] = useState<StorageDiagnostics>(() => services.storageDiagnostics());

  /* `session` is read inside callbacks that must not be re-created on every
     answer, so the latest value is mirrored in a ref. */
  const sessionRef = useRef<SessionState | null>(null);
  sessionRef.current = session;

  const theme: 'light' | 'dark' = preferences.darkMode ? 'dark' : 'light';

  const refresh = useCallback(async () => {
    const [subjects, views, homeView] = await Promise.all([
      services.content.getSubjects(progress.getPreferences().contentLanguage),
      learning.getSubjectViews(),
      learning.getHomeView(),
    ]);
    setAllSubjects(subjects);
    setSubjectViews(views);
    setHome(homeView);
    setProgressState(progress.getState());
    setLoading(false);
  }, [learning, progress, services.content]);

  /* Boot: load catalogue, then restore a session that was interrupted. */
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await refresh();
      if (cancelled) return;
      const resumable = await learning.resumeActiveSession();
      if (cancelled || !resumable) return;
      setSession(
        startSession({
          id: resumable.id,
          kind: resumable.kind,
          label: resumable.label,
          items: resumable.items,
          lessonId: resumable.lessonId,
          subjectId: resumable.subjectId,
          startIndex: resumable.index,
          previousResults: resumable.results,
          now: resumable.startedAt,
        }),
      );
      setRoute({ name: 'session' });
    })();
    return () => {
      cancelled = true;
    };
  }, [learning, refresh]);

  /**
   * Reconcile the two copies of learner state.
   *
   * Runs alongside the first paint rather than blocking it: the synchronous
   * store has already given us something to draw, and this only matters in the
   * case where that something was empty because the browser had swept
   * `localStorage`. When the mirror does have a history, the service reloads
   * from the repaired store and the screens re-render with it.
   */
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const restored = await services.hydrateStorage();
      if (cancelled) return;
      if (restored) {
        const state = progress.reload();
        track('progress_restored_from_mirror', { answers: state.attempts.length });
        setPreferences(progress.getPreferences());
        setProgressState(state);
        setRoute(progress.getPreferences().onboarded ? { name: 'home' } : { name: 'onboarding-subjects' });
        await refresh();
      }
      if (!cancelled) setStorage(services.storageDiagnostics());
    })();
    return () => {
      cancelled = true;
    };
  }, [progress, refresh, services]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  /* ─────────────────────────────────────────────────────────── navigation */

  const go = useCallback((next: Route) => setRoute(next), []);

  const goTab = useCallback(
    (tab: TabName) => {
      setRoute(routeForTab(tab));
      void refresh();
    },
    [refresh],
  );

  const back = useCallback(() => {
    setRoute((current) => {
      switch (current.name) {
        case 'module':
          return { name: 'subject', subjectId: current.subjectId };
        case 'subject':
          return { name: 'learn' };
        case 'lesson-intro':
          return { name: 'home' };
        default:
          return { name: 'home' };
      }
    });
  }, []);

  /* ───────────────────────────────────────────────────────── preferences */

  const applyPreferences = useCallback(
    (next: UserPreferences) => {
      setPreferences(progress.setPreferences(next));
    },
    [progress],
  );

  const toggleSubject = useCallback(
    (subjectId: string) => {
      const selected = preferences.subjects.includes(subjectId);
      const subjects = selected
        ? preferences.subjects.filter((id) => id !== subjectId)
        : [...preferences.subjects, subjectId];
      if (!selected) track('subject_selected', { subjectId, source: 'onboarding' });

      const subjectLevels = { ...preferences.subjectLevels };
      if (!selected && !subjectLevels[subjectId]) subjectLevels[subjectId] = 'beginner';
      applyPreferences({ ...preferences, subjects, subjectLevels });
    },
    [applyPreferences, preferences],
  );

  const setLevel = useCallback(
    (subjectId: string, level: Level) => {
      setPreferences(progress.setSubjectLevel(subjectId, level));
      void refresh();
    },
    [progress, refresh],
  );

  const setDailyGoal = useCallback(
    (minutes: number) => applyPreferences({ ...preferences, dailyGoalMinutes: minutes }),
    [applyPreferences, preferences],
  );

  const completeOnboarding = useCallback(() => {
    track('onboarding_completed', {
      subjects: preferences.subjects,
      dailyGoalMinutes: preferences.dailyGoalMinutes,
    });
    applyPreferences({ ...preferences, onboarded: true });
    setRoute({ name: 'home' });
    void refresh();
  }, [applyPreferences, preferences, refresh]);

  const restartOnboarding = useCallback(() => {
    applyPreferences({ ...preferences, onboarded: false });
    setSession(null);
    setRoute({ name: 'onboarding-subjects' });
  }, [applyPreferences, preferences]);

  const setTheme = useCallback(
    (next: 'light' | 'dark') => applyPreferences({ ...preferences, darkMode: next === 'dark' }),
    [applyPreferences, preferences],
  );

  const setReminders = useCallback(
    (enabled: boolean) => applyPreferences({ ...preferences, remindersEnabled: enabled }),
    [applyPreferences, preferences],
  );

  const setInterfaceLanguage = useCallback(
    (language: Language) => applyPreferences({ ...preferences, interfaceLanguage: language }),
    [applyPreferences, preferences],
  );

  /**
   * Switching content language re-reads the catalogue. Progress survives it
   * untouched: attempts and review items are keyed by exercise id, and the
   * validator guarantees ids are identical across translations.
   */
  const setContentLanguage = useCallback(
    (language: Language) => {
      applyPreferences({ ...preferences, contentLanguage: language });
      void refresh();
    },
    [applyPreferences, preferences, refresh],
  );

  const resetProgress = useCallback(() => {
    setProgressState(progress.resetProgress());
    setSession(null);
    setSummary(null);
    setRoute({ name: 'home' });
    void refresh();
  }, [progress, refresh]);

  /* ──────────────────────────────────────────────────────────── backups */

  /**
   * Hands the learner a file.
   *
   * There is no backend to sync through, so this is the only way progress
   * moves to a new phone — and the only copy a browser cannot decide to
   * delete. Built as an object URL and revoked straight after; nothing here
   * needs the network.
   */
  const exportBackup = useCallback(() => {
    const backup = progress.exportBackup();
    track('backup_exported', { answers: backup.progress.attempts.length });

    const blob = new Blob([serializeBackup(backup)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = backupFilename(new Date());
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }, [progress]);

  const importBackup = useCallback(
    (text: string): ImportOutcome => {
      const parsed = parseBackup(text);
      if (!parsed.ok) return parsed;

      const state = progress.importBackup(parsed.backup);
      setPreferences(progress.getPreferences());
      setProgressState(state);
      setSession(null);
      setSummary(null);
      // Deliberately staying put: the learner asked for this from Profile and
      // needs to see the result there. Navigating away would hide it.
      void refresh();
      return { ok: true, summary: parsed.summary };
    },
    [progress, refresh],
  );

  /* ───────────────────────────────────────────────────────────── sessions */

  const startLesson = useCallback(
    (lessonId: string) => {
      void (async () => {
        const built = await learning.buildLessonSession(lessonId);
        if (!built) return;
        const { lesson, items, startIndex } = built;

        setProgressState(
          progress.startLesson({
            lessonId: lesson.id,
            subjectId: lesson.subject,
            moduleId: lesson.module,
            level: lesson.level,
            totalExercises: lesson.exercises.length,
          }),
        );

        const subject = await services.content.getSubject(lesson.subject, preferences.contentLanguage);
        const next = startSession({
          id: `lesson-${lesson.id}-${Date.now()}`,
          kind: 'lesson',
          label: `${subject?.name ?? lesson.subject} · ${lesson.title}`,
          items,
          lessonId: lesson.id,
          subjectId: lesson.subject,
          startIndex,
        });
        setSession(next);
        setProgressState(progress.saveActiveSession(next));
        setRoute({ name: 'session' });
      })();
    },
    [learning, preferences.contentLanguage, progress, services.content],
  );

  const startReview = useCallback(() => {
    void (async () => {
      const items = await learning.buildReviewSession(10);
      if (items.length === 0) return;
      const next = startSession({
        id: `review-${Date.now()}`,
        kind: 'review',
        label: 'Review session',
        items,
      });
      setSession(next);
      setProgressState(progress.saveActiveSession(next));
      setRoute({ name: 'session' });
    })();
  }, [learning, progress]);

  const selectOption = useCallback((optionId: string) => {
    setSession((current) => (current ? selectOptionState(current, optionId) : current));
  }, []);

  const flipCard = useCallback(() => {
    setSession((current) => (current ? flipCardState(current) : current));
  }, []);

  /** Ends the session: writes the StudySession, closes the lesson, shows the summary. */
  const finish = useCallback(
    (finished: SessionState) => {
      const stats = sessionSummary(finished);
      const subjectId = finished.subjectId ?? finished.items[0]?.subjectId;

      let nextState = progress.finishSession({
        id: finished.id,
        kind: finished.kind,
        subjectId,
        lessonId: finished.lessonId,
        startedAt: finished.startedAt,
        results: finished.results,
        durationSeconds: stats.durationSeconds,
      });

      if (finished.kind === 'lesson' && finished.lessonId) {
        nextState = progress.completeLesson(finished.lessonId, stats.durationSeconds);
      }

      setProgressState(nextState);
      setSummary({
        kind: finished.kind,
        kicker: finished.kind === 'review' ? 'Review' : 'Session complete',
        title: finished.kind === 'review' ? 'Review done' : 'Lesson complete',
        correct: stats.correct,
        total: stats.total,
        accuracy: stats.accuracy,
        durationSeconds: stats.durationSeconds,
        practised: stats.practisedTopics,
        weak: stats.weakTopics,
      });
      setSession(null);
      setRoute({ name: 'summary' });
      void refresh();
    },
    [progress, refresh],
  );

  /** The single main action: check the answer, or move to the next exercise. */
  const submit = useCallback(() => {
    const current = sessionRef.current;
    if (!current) return;
    const item = currentItem(current);
    if (!item) return;

    // A flashcard reveals first; the learner grades it with Again / Got it.
    if (isSelfGraded(item.exercise) && !current.flipped) {
      setSession(flipCardState(current));
      return;
    }

    if (!current.checked) {
      const { state, outcome } = checkAnswer(current);
      if (!outcome) return;
      setProgressState(
        progress.recordAttempt({
          exercise: outcome.exercise,
          lessonId: outcome.item.lessonId,
          subjectId: outcome.item.subjectId,
          correct: outcome.correct,
          durationSeconds: outcome.durationSeconds,
        }),
      );
      setSession(state);
      setProgressState(progress.saveActiveSession(state));
      return;
    }

    const next = advance(current);
    if (next.finished) {
      finish(next);
      return;
    }
    setSession(next);
    setProgressState(progress.saveActiveSession(next));
  }, [finish, progress]);

  const answerFlashcard = useCallback(
    (remembered: boolean) => {
      const current = sessionRef.current;
      if (!current) return;
      const { state, outcome } = checkAnswer(current, { kind: 'self', remembered });
      if (!outcome) return;

      progress.recordAttempt({
        exercise: outcome.exercise,
        lessonId: outcome.item.lessonId,
        subjectId: outcome.item.subjectId,
        correct: outcome.correct,
        durationSeconds: outcome.durationSeconds,
      });

      const next = advance(state);
      if (next.finished) {
        finish(next);
        return;
      }
      setSession(next);
      setProgressState(progress.saveActiveSession(next));
    },
    [finish, progress],
  );

  const exitSession = useCallback(() => {
    const current = sessionRef.current;
    setProgressState(progress.clearActiveSession());
    setSession(null);
    setRoute(current?.kind === 'lesson' && current.lessonId ? { name: 'lesson-intro', lessonId: current.lessonId } : { name: 'home' });
    void refresh();
  }, [progress, refresh]);

  const translator = useMemo(() => createTranslator(preferences.interfaceLanguage), [preferences.interfaceLanguage]);

  useEffect(() => {
    document.documentElement.setAttribute('lang', preferences.interfaceLanguage);
  }, [preferences.interfaceLanguage]);

  return {
    ...translator,
    services,
    route,
    tab: tabForRoute(route),
    theme,
    preferences,
    progressState,
    allSubjects,
    subjectViews,
    home,
    session,
    summary,
    loading,
    go,
    goTab,
    back,
    toggleSubject,
    setLevel,
    setDailyGoal,
    completeOnboarding,
    restartOnboarding,
    setTheme,
    setReminders,
    setInterfaceLanguage,
    setContentLanguage,
    resetProgress,
    storage,
    exportBackup,
    importBackup,
    startLesson,
    startReview,
    selectOption,
    flipCard,
    submit,
    answerFlashcard,
    exitSession,
  };
}
