/**
 * The write side of learner state.
 *
 * Everything that changes progress goes through here: recording an attempt,
 * opening and closing a lesson, opening and closing a study session, and
 * keeping the review queue in step. Screens never mutate state themselves —
 * they call a method and re-render from the snapshot it returns.
 *
 * Persistence happens after every mutation, which is also what makes the
 * offline requirement hold: kill the app mid-lesson and the active session,
 * including the answers already given, is still on disk.
 */
import { track } from '../analytics/analytics.ts';
import type { Exercise, Level } from '../domain/schema.ts';
import { SimpleSpacedRepetition, type ReviewScheduler } from '../review/ReviewScheduler.ts';
import type { ItemResult, SessionState } from '../session/sessionEngine.ts';
import {
  emptyProgressState,
  type ActiveSession,
  type ExerciseAttempt,
  type LessonProgress,
  type ProgressState,
  type ReviewItem,
  type SessionKind,
  type StudySession,
  type UserPreferences,
} from './models.ts';
import type { ProgressStore } from './ProgressStore.ts';
import { localDate } from './stats.ts';

export interface RecordAttemptInput {
  exercise: Exercise;
  lessonId: string;
  subjectId: string;
  correct: boolean;
  durationSeconds: number;
}

export interface StartLessonInput {
  lessonId: string;
  subjectId: string;
  moduleId: string;
  level: Level;
  totalExercises: number;
}

export class ProgressService {
  private state: ProgressState;
  private preferences: UserPreferences;

  constructor(
    private readonly store: ProgressStore,
    private readonly scheduler: ReviewScheduler = new SimpleSpacedRepetition(),
    private readonly clock: () => Date = () => new Date(),
  ) {
    this.state = store.loadProgress();
    this.preferences = store.loadPreferences();
  }

  getState(): ProgressState {
    return this.state;
  }

  getPreferences(): UserPreferences {
    return this.preferences;
  }

  /* ────────────────────────────────────────────────────────── preferences */

  setPreferences(next: UserPreferences): UserPreferences {
    this.preferences = next;
    this.store.savePreferences(next);
    return next;
  }

  updatePreferences(patch: Partial<UserPreferences>): UserPreferences {
    return this.setPreferences({ ...this.preferences, ...patch });
  }

  setSubjectLevel(subjectId: string, level: Level): UserPreferences {
    const previous = this.preferences.subjectLevels[subjectId] ?? null;
    if (previous !== level) track('level_changed', { subjectId, level, previousLevel: previous });
    return this.setPreferences({
      ...this.preferences,
      subjectLevels: { ...this.preferences.subjectLevels, [subjectId]: level },
    });
  }

  /* ───────────────────────────────────────────────────────────── lessons */

  startLesson(input: StartLessonInput): ProgressState {
    const now = this.clock().toISOString();
    const existing = this.lesson(input.lessonId);

    const progress: LessonProgress = existing
      ? { ...existing, status: existing.status === 'completed' ? 'completed' : 'in_progress', totalExercises: input.totalExercises }
      : {
          lessonId: input.lessonId,
          subjectId: input.subjectId,
          moduleId: input.moduleId,
          status: 'in_progress',
          correctCount: 0,
          incorrectCount: 0,
          startedAt: now,
          totalExercises: input.totalExercises,
          nextExerciseIndex: 0,
        };

    track('lesson_started', {
      lessonId: input.lessonId,
      subjectId: input.subjectId,
      moduleId: input.moduleId,
      level: input.level,
    });

    return this.commit({
      ...this.state,
      lastSubjectId: input.subjectId,
      lessons: upsert(this.state.lessons, progress, (l) => l.lessonId === input.lessonId),
    });
  }

  /**
   * Records one graded answer and, in the same step, updates the review
   * schedule for that exercise. Wrong answers enter the queue; right ones move
   * further down the ladder (and are only tracked once they are in it).
   */
  recordAttempt(input: RecordAttemptInput): ProgressState {
    const now = this.clock();
    const iso = now.toISOString();
    const priorAttempts = this.state.attempts.filter((a) => a.exerciseId === input.exercise.id).length;

    const attempt: ExerciseAttempt = {
      exerciseId: input.exercise.id,
      lessonId: input.lessonId,
      subjectId: input.subjectId,
      tags: input.exercise.tags,
      correct: input.correct,
      answeredAt: iso,
      durationSeconds: input.durationSeconds,
      attempts: priorAttempts + 1,
    };

    track('exercise_answered', {
      exerciseId: input.exercise.id,
      lessonId: input.lessonId,
      subjectId: input.subjectId,
      type: input.exercise.type,
      difficulty: input.exercise.difficulty,
      tags: input.exercise.tags,
      correct: input.correct,
      durationSeconds: input.durationSeconds,
      attempts: attempt.attempts,
    });

    const lesson = this.lesson(input.lessonId);
    const lessons = lesson
      ? upsert(
          this.state.lessons,
          {
            ...lesson,
            correctCount: lesson.correctCount + (input.correct ? 1 : 0),
            incorrectCount: lesson.incorrectCount + (input.correct ? 0 : 1),
            nextExerciseIndex: lesson.nextExerciseIndex + 1,
          },
          (l) => l.lessonId === input.lessonId,
        )
      : this.state.lessons;

    return this.commit({
      ...this.state,
      attempts: [...this.state.attempts, attempt],
      lessons,
      reviewQueue: this.applyReview(input, now),
      studyDays: addDay(this.state.studyDays, localDate(now)),
      lastSubjectId: input.subjectId,
    });
  }

  completeLesson(lessonId: string, durationSeconds: number): ProgressState {
    const lesson = this.lesson(lessonId);
    if (!lesson) return this.state;
    const now = this.clock().toISOString();

    track('lesson_completed', {
      lessonId,
      subjectId: lesson.subjectId,
      correct: lesson.correctCount,
      incorrect: lesson.incorrectCount,
      durationSeconds,
    });

    return this.commit({
      ...this.state,
      lessons: upsert(
        this.state.lessons,
        { ...lesson, status: 'completed', completedAt: now, nextExerciseIndex: 0 },
        (l) => l.lessonId === lessonId,
      ),
    });
  }

  /* ──────────────────────────────────────────────────────────── sessions */

  /** Stores the in-flight session so it survives a reload or going offline. */
  saveActiveSession(session: SessionState): ProgressState {
    const active: ActiveSession = {
      id: session.id,
      kind: session.kind,
      lessonId: session.lessonId,
      subjectId: session.subjectId,
      label: session.label,
      exerciseIds: session.items.map((item) => item.exercise.id),
      index: session.index,
      startedAt: new Date(session.startedAt).toISOString(),
      results: session.results.map((r: ItemResult) => ({
        exerciseId: r.exerciseId,
        topic: r.topic,
        tags: r.tags,
        correct: r.correct,
        durationSeconds: r.durationSeconds,
      })),
    };
    return this.commit({ ...this.state, activeSession: active });
  }

  clearActiveSession(): ProgressState {
    const next = { ...this.state };
    delete next.activeSession;
    return this.commit(next);
  }

  finishSession(input: {
    id: string;
    kind: SessionKind;
    subjectId?: string;
    lessonId?: string;
    startedAt: number;
    results: ItemResult[];
    durationSeconds: number;
  }): ProgressState {
    const correct = input.results.filter((r) => r.correct).length;
    const session: StudySession = {
      id: input.id,
      kind: input.kind,
      subjectId: input.subjectId,
      lessonId: input.lessonId,
      startedAt: new Date(input.startedAt).toISOString(),
      completedAt: this.clock().toISOString(),
      numberOfExercises: input.results.length,
      correctAnswers: correct,
      incorrectAnswers: input.results.length - correct,
      durationSeconds: input.durationSeconds,
    };

    if (input.kind === 'review') {
      track('review_completed', {
        itemCount: input.results.length,
        correct,
        durationSeconds: input.durationSeconds,
      });
    }

    const next = { ...this.state, sessions: [...this.state.sessions, session] };
    delete next.activeSession;
    return this.commit(next);
  }

  /* ──────────────────────────────────────────────────────────── review */

  reviewQueue(): ReviewItem[] {
    return this.state.reviewQueue;
  }

  private applyReview(input: RecordAttemptInput, now: Date): ReviewItem[] {
    const existing = this.state.reviewQueue.find((item) => item.exerciseId === input.exercise.id);

    // A correct answer on an exercise that was never wrong does not create work.
    if (!existing && input.correct) return this.state.reviewQueue;

    const outcome = this.scheduler.next(existing ?? null, input.correct, now);
    const item: ReviewItem = {
      exerciseId: input.exercise.id,
      lessonId: input.lessonId,
      subjectId: input.subjectId,
      nextReviewAt: outcome.nextReviewAt,
      reviewStage: outcome.reviewStage,
      lapses: (existing?.lapses ?? 0) + (input.correct ? 0 : 1),
      lastReviewedAt: now.toISOString(),
    };
    return upsert(this.state.reviewQueue, item, (r) => r.exerciseId === input.exercise.id);
  }

  /* ───────────────────────────────────────────────────────────── misc */

  resetProgress(): ProgressState {
    this.store.clear();
    this.store.savePreferences(this.preferences);
    this.state = emptyProgressState();
    this.store.saveProgress(this.state);
    return this.state;
  }

  private lesson(lessonId: string): LessonProgress | undefined {
    return this.state.lessons.find((l) => l.lessonId === lessonId);
  }

  private commit(state: ProgressState): ProgressState {
    this.state = state;
    this.store.saveProgress(state);
    return state;
  }
}

function upsert<T>(list: T[], value: T, match: (item: T) => boolean): T[] {
  const index = list.findIndex(match);
  if (index === -1) return [...list, value];
  const copy = [...list];
  copy[index] = value;
  return copy;
}

function addDay(days: string[], day: string): string[] {
  return days.includes(day) ? days : [...days, day].sort();
}
