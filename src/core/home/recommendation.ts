/**
 * What Home puts behind the "Continue" button.
 *
 * The priority order is fixed by the spec:
 *   1. a lesson already started but not finished
 *   2. items due for review
 *   3. the next lesson in the subject last studied
 *   4. the next available lesson anywhere
 *
 * It is a pure function of the unlocked lesson list plus stored progress, so
 * it can be unit-tested without a repository, a clock or a DOM.
 */
import type { LessonProgress, ProgressState } from '../progress/models.ts';

/** Flattened, already level-filtered view of one lesson. */
export interface LessonRef {
  lessonId: string;
  title: string;
  subjectId: string;
  subjectName: string;
  moduleId: string;
  moduleTitle: string;
  estimatedMinutes: number;
  exerciseCount: number;
}

export type Recommendation =
  | { kind: 'continue_lesson'; lesson: LessonRef; progressPercent: number }
  | { kind: 'review'; dueCount: number }
  | { kind: 'next_lesson'; lesson: LessonRef; progressPercent: number }
  | { kind: 'nothing_available' };

export interface RecommendationInput {
  /** Every unlocked lesson, in subject → module → lesson order. */
  lessons: LessonRef[];
  progress: ProgressState;
  dueReviewCount: number;
}

export function recommendNext({ lessons, progress, dueReviewCount }: RecommendationInput): Recommendation {
  const progressByLesson = new Map(progress.lessons.map((l) => [l.lessonId, l]));

  // 1 — an unfinished lesson, most recently started first.
  const started = progress.lessons
    .filter((l) => l.status === 'in_progress')
    .sort((a, b) => (b.startedAt ?? '').localeCompare(a.startedAt ?? ''));
  for (const entry of started) {
    const lesson = lessons.find((l) => l.lessonId === entry.lessonId);
    if (lesson) return { kind: 'continue_lesson', lesson, progressPercent: lessonPercent(entry) };
  }

  // 2 — reviews that are due.
  if (dueReviewCount > 0) return { kind: 'review', dueCount: dueReviewCount };

  // 3 — the next lesson in the subject last studied.
  const lastSubjectId = progress.lastSubjectId;
  if (lastSubjectId) {
    const next = lessons.find((l) => l.subjectId === lastSubjectId && !isCompleted(progressByLesson, l.lessonId));
    if (next) return { kind: 'next_lesson', lesson: next, progressPercent: 0 };
  }

  // 4 — the next available lesson anywhere.
  const next = lessons.find((l) => !isCompleted(progressByLesson, l.lessonId));
  if (next) return { kind: 'next_lesson', lesson: next, progressPercent: 0 };

  return { kind: 'nothing_available' };
}

function isCompleted(byLesson: Map<string, LessonProgress>, lessonId: string): boolean {
  return byLesson.get(lessonId)?.status === 'completed';
}

export function lessonPercent(progress: LessonProgress | undefined | null): number {
  if (!progress || progress.totalExercises === 0) return 0;
  if (progress.status === 'completed') return 100;
  return Math.min(100, Math.round((progress.nextExerciseIndex / progress.totalExercises) * 100));
}
