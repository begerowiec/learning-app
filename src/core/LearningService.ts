/**
 * The application service the UI talks to.
 *
 * It is the only place that knows about both content and progress, and it is
 * what keeps React components free of domain logic: a screen asks for a view
 * model and renders it. Swapping `LocalContentRepository` for an HTTP one, or
 * `LocalProgressStore` for a synced backend, happens in the constructor call
 * and nowhere else.
 */
import type { ContentRepository } from './content/ContentRepository.ts';
import { levelLabel, type Language, type Lesson, type Level, type Module, type Subject } from './domain/schema.ts';
import { lessonPercent, recommendNext, type LessonRef, type Recommendation } from './home/recommendation.ts';
import type { LessonProgress, LessonStatus, ProgressState, UserPreferences } from './progress/models.ts';
import type { ProgressService } from './progress/ProgressService.ts';
import { dueItems } from './review/ReviewScheduler.ts';
import { exerciseTopic } from './session/grading.ts';
import type { ItemResult, ReviewNote, SessionItem } from './session/sessionEngine.ts';
import { track } from './analytics/analytics.ts';

export interface LessonView {
  lesson: Lesson;
  /** False when this lesson is being served as an English fallback. */
  localized: boolean;
  status: LessonStatus;
  percent: number;
  correctCount: number;
  incorrectCount: number;
}

export interface ModuleView {
  module: Module;
  lessons: LessonView[];
  percent: number;
  status: 'not_started' | 'in progress' | 'completed';
  completedLessons: number;
}

export interface SubjectView {
  subject: Subject;
  level: Level;
  levelName: string;
  modules: ModuleView[];
  lessonCount: number;
  completedLessons: number;
  percent: number;
  lastStudiedAt: string | null;
}

export interface HomeView {
  recommendation: Recommendation;
  dueReviewCount: number;
  subjects: SubjectView[];
}

export interface ResumableSession {
  items: SessionItem[];
  index: number;
  results: ItemResult[];
  label: string;
  kind: 'lesson' | 'review';
  id: string;
  lessonId?: string;
  subjectId?: string;
  startedAt: number;
}

export class LearningService {
  constructor(
    private readonly content: ContentRepository,
    private readonly progress: ProgressService,
  ) {}

  /** The language lessons are currently served in. */
  private get language(): Language {
    return this.progress.getPreferences().contentLanguage;
  }

  /* ───────────────────────────────────────────────────────── catalogue */

  /** The learner's selected subjects, expanded with modules, lessons and progress. */
  async getSubjectViews(preferences: UserPreferences = this.progress.getPreferences()): Promise<SubjectView[]> {
    const all = await this.content.getSubjects(this.language);
    const selected = preferences.subjects.length > 0 ? preferences.subjects : all.map((s) => s.id);
    const state = this.progress.getState();

    const views: SubjectView[] = [];
    for (const subject of all) {
      if (!selected.includes(subject.id)) continue;
      views.push(await this.buildSubjectView(subject, preferences, state));
    }
    return views.sort((a, b) => selected.indexOf(a.subject.id) - selected.indexOf(b.subject.id));
  }

  async getSubjectView(subjectId: string): Promise<SubjectView | null> {
    const subject = await this.content.getSubject(subjectId, this.language);
    if (!subject) return null;
    return this.buildSubjectView(subject, this.progress.getPreferences(), this.progress.getState());
  }

  private async buildSubjectView(
    subject: Subject,
    preferences: UserPreferences,
    state: ProgressState,
  ): Promise<SubjectView> {
    const level = preferences.subjectLevels[subject.id] ?? 'beginner';
    const modules = await this.content.getModules(subject.id, level, this.language);
    const byLesson = new Map(state.lessons.map((l) => [l.lessonId, l]));

    const moduleViews: ModuleView[] = [];
    for (const module of modules) {
      const lessons = await this.content.getLessons(module.id, this.language);
      const lessonViews = lessons.map((lesson) =>
        toLessonView(lesson, byLesson.get(lesson.id), this.content.isLessonLocalized(lesson.id, this.language)),
      );
      const completed = lessonViews.filter((l) => l.status === 'completed').length;
      const percent = lessonViews.length === 0 ? 0 : Math.round((completed / lessonViews.length) * 100);
      moduleViews.push({
        module,
        lessons: lessonViews,
        percent,
        completedLessons: completed,
        status: percent === 100 ? 'completed' : percent > 0 || lessonViews.some((l) => l.status === 'in_progress') ? 'in progress' : 'not_started',
      });
    }

    const lessonCount = moduleViews.reduce((n, m) => n + m.lessons.length, 0);
    const completedLessons = moduleViews.reduce((n, m) => n + m.completedLessons, 0);
    const lastStudiedAt = state.attempts
      .filter((a) => a.subjectId === subject.id)
      .reduce<string | null>((latest, a) => (latest === null || a.answeredAt > latest ? a.answeredAt : latest), null);

    return {
      subject,
      level,
      levelName: levelLabel(subject, level),
      modules: moduleViews,
      lessonCount,
      completedLessons,
      percent: lessonCount === 0 ? 0 : Math.round((completedLessons / lessonCount) * 100),
      lastStudiedAt,
    };
  }

  /* ──────────────────────────────────────────────────────────── home */

  async getHomeView(): Promise<HomeView> {
    const subjects = await this.getSubjectViews();
    const state = this.progress.getState();
    const due = dueItems(state.reviewQueue);

    const lessons: LessonRef[] = subjects.flatMap((subjectView) =>
      subjectView.modules.flatMap((moduleView) =>
        moduleView.lessons.map((lessonView) => ({
          lessonId: lessonView.lesson.id,
          title: lessonView.lesson.title,
          subjectId: subjectView.subject.id,
          subjectName: subjectView.subject.name,
          moduleId: moduleView.module.id,
          moduleTitle: moduleView.module.title,
          estimatedMinutes: lessonView.lesson.estimatedMinutes,
          exerciseCount: lessonView.lesson.exercises.length,
        })),
      ),
    );

    return {
      recommendation: recommendNext({ lessons, progress: state, dueReviewCount: due.length }),
      dueReviewCount: due.length,
      subjects,
    };
  }

  /* ─────────────────────────────────────────────────────────── sessions */

  /**
   * Builds the exercise list for a lesson. A lesson already in progress
   * resumes at the first unanswered exercise rather than starting over.
   */
  async buildLessonSession(lessonId: string): Promise<{ lesson: Lesson; items: SessionItem[]; startIndex: number } | null> {
    const lesson = await this.content.getLesson(lessonId, this.language);
    if (!lesson) return null;
    const stored = this.progress.getState().lessons.find((l) => l.lessonId === lessonId);
    const startIndex =
      stored && stored.status === 'in_progress' ? Math.min(stored.nextExerciseIndex, lesson.exercises.length - 1) : 0;

    return {
      lesson,
      startIndex,
      items: lesson.exercises.map((exercise) => ({
        exercise,
        lessonId: lesson.id,
        subjectId: lesson.subject,
      })),
    };
  }

  /**
   * Builds a review session from the due queue. Items whose exercise no longer
   * exists in the catalogue are skipped — content can be regenerated, and a
   * stale queue entry must not break the session.
   */
  async buildReviewSession(limit = 10, now: Date = new Date()): Promise<SessionItem[]> {
    const due = dueItems(this.progress.getState().reviewQueue, now).slice(0, limit);
    const items: SessionItem[] = [];

    for (const entry of due) {
      const ref = await this.content.getExercise(entry.exerciseId, this.language);
      if (!ref) continue;
      items.push({
        exercise: ref.exercise,
        lessonId: ref.lessonId,
        subjectId: ref.subjectId,
        note: reviewNote(entry.lapses, entry.lastReviewedAt, now),
      });
    }

    if (items.length > 0) track('review_started', { itemCount: items.length });
    return items;
  }

  /** Rebuilds the session that was in flight when the app was last closed. */
  async resumeActiveSession(): Promise<ResumableSession | null> {
    const active = this.progress.getState().activeSession;
    if (!active) return null;

    const items: SessionItem[] = [];
    for (const exerciseId of active.exerciseIds) {
      const ref = await this.content.getExercise(exerciseId, this.language);
      if (!ref) continue;
      items.push({ exercise: ref.exercise, lessonId: ref.lessonId, subjectId: ref.subjectId });
    }
    if (items.length === 0) return null;

    return {
      items,
      index: Math.min(active.index, items.length - 1),
      results: active.results.map((r) => ({ ...r })),
      label: active.label,
      kind: active.kind,
      id: active.id,
      lessonId: active.lessonId,
      subjectId: active.subjectId,
      startedAt: Date.parse(active.startedAt),
    };
  }

  /** Exercise ids → human topic labels, for the review and weak-area lists. */
  async topicFor(exerciseId: string): Promise<string | null> {
    const ref = await this.content.getExercise(exerciseId, this.language);
    return ref ? exerciseTopic(ref.exercise) : null;
  }
}

function toLessonView(lesson: Lesson, progress: LessonProgress | undefined, localized: boolean): LessonView {
  return {
    lesson,
    localized,
    status: progress?.status ?? 'not_started',
    percent: lessonPercent(progress),
    correctCount: progress?.correctCount ?? 0,
    incorrectCount: progress?.incorrectCount ?? 0,
  };
}

function reviewNote(lapses: number, lastReviewedAt: string | undefined, now: Date): ReviewNote {
  if (lapses >= 2) return { kind: 'wrongTimes', count: lapses };
  if (!lastReviewedAt) return { kind: 'added' };
  const days = Math.max(0, Math.round((now.getTime() - Date.parse(lastReviewedAt)) / 86_400_000));
  return days === 0 ? { kind: 'seenToday' } : { kind: 'seenDaysAgo', count: days };
}
