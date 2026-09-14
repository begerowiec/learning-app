/**
 * Everything the app remembers about a learner.
 *
 * Attempts are the source of truth; lesson progress, sessions and the review
 * queue are derived state kept alongside them so the UI never has to replay
 * the whole history to draw a screen.
 *
 * Attempts carry a denormalised copy of the exercise's subject and tags. That
 * is deliberate: the strengths/weaknesses analysis must keep working for a
 * lesson that has since been re-generated or removed from the catalogue, and
 * it must not have to load content to compute a statistic.
 */
import { DEFAULT_LANGUAGE, LANGUAGES, LEVELS, type Language, type Level } from '../domain/schema.ts';
import { v, type Infer } from '../domain/validation.ts';

export const LESSON_STATUSES = ['not_started', 'in_progress', 'completed'] as const;
export type LessonStatus = (typeof LESSON_STATUSES)[number];

export const PROGRESS_STATE_VERSION = 1;

export const ExerciseAttemptSchema = v.object({
  exerciseId: v.string().min(1),
  lessonId: v.string().min(1),
  subjectId: v.string().min(1),
  tags: v.array(v.string().min(1)).max(8),
  correct: v.boolean(),
  /** ISO timestamp. */
  answeredAt: v.string().min(1),
  durationSeconds: v.number().min(0),
  /** Which attempt at this exercise this was, counting from 1. */
  attempts: v.number().int().min(1),
});
export type ExerciseAttempt = Infer<typeof ExerciseAttemptSchema>;

export const LessonProgressSchema = v.object({
  lessonId: v.string().min(1),
  subjectId: v.string().min(1),
  moduleId: v.string().min(1),
  status: v.enum(LESSON_STATUSES),
  correctCount: v.number().int().min(0),
  incorrectCount: v.number().int().min(0),
  startedAt: v.string().min(1).optional(),
  completedAt: v.string().min(1).optional(),
  /** Exercises in the lesson when it was last practised — for the progress bar. */
  totalExercises: v.number().int().min(0),
  /** Resume position: index of the next unanswered exercise. */
  nextExerciseIndex: v.number().int().min(0).default(0),
});
export type LessonProgress = Infer<typeof LessonProgressSchema>;

export const SESSION_KINDS = ['lesson', 'review'] as const;
export type SessionKind = (typeof SESSION_KINDS)[number];

export const StudySessionSchema = v.object({
  id: v.string().min(1),
  kind: v.enum(SESSION_KINDS),
  subjectId: v.string().min(1).optional(),
  lessonId: v.string().min(1).optional(),
  startedAt: v.string().min(1),
  completedAt: v.string().min(1).optional(),
  numberOfExercises: v.number().int().min(0),
  correctAnswers: v.number().int().min(0),
  incorrectAnswers: v.number().int().min(0),
  durationSeconds: v.number().min(0),
});
export type StudySession = Infer<typeof StudySessionSchema>;

export const ReviewItemSchema = v.object({
  exerciseId: v.string().min(1),
  lessonId: v.string().min(1),
  subjectId: v.string().min(1),
  /** ISO timestamp; the item is due when this is in the past. */
  nextReviewAt: v.string().min(1),
  /** Index into the scheduler's interval ladder. */
  reviewStage: v.number().int().min(0),
  /** How many times this item has been answered wrong since it was added. */
  lapses: v.number().int().min(0).default(0),
  lastReviewedAt: v.string().min(1).optional(),
});
export type ReviewItem = Infer<typeof ReviewItemSchema>;

/**
 * A session in flight, persisted after every answer.
 *
 * This is the offline minimum from the spec: close the app mid-lesson, come
 * back with no connection, and the same session resumes at the same exercise.
 */
export const ActiveSessionSchema = v.object({
  id: v.string().min(1),
  kind: v.enum(SESSION_KINDS),
  lessonId: v.string().min(1).optional(),
  subjectId: v.string().min(1).optional(),
  label: v.string().min(1),
  exerciseIds: v.array(v.string().min(1)).min(1),
  index: v.number().int().min(0),
  startedAt: v.string().min(1),
  results: v.array(
    v.object({
      exerciseId: v.string().min(1),
      topic: v.string().min(1),
      tags: v.array(v.string().min(1)).max(8),
      correct: v.boolean(),
      durationSeconds: v.number().min(0),
    }),
  ),
});
export type ActiveSession = Infer<typeof ActiveSessionSchema>;
export type SessionResult = ActiveSession['results'][number];

export const ProgressStateSchema = v.object({
  version: v.number().int().min(1),
  attempts: v.array(ExerciseAttemptSchema),
  lessons: v.array(LessonProgressSchema),
  sessions: v.array(StudySessionSchema),
  reviewQueue: v.array(ReviewItemSchema),
  /** Drives Home's "next lesson in the subject you were last in". */
  lastSubjectId: v.string().min(1).optional(),
  /** Local dates (YYYY-MM-DD) with at least one answered exercise. */
  studyDays: v.array(v.string().min(8).max(10)),
  activeSession: ActiveSessionSchema.optional(),
});
export type ProgressState = Infer<typeof ProgressStateSchema>;

export function emptyProgressState(): ProgressState {
  return {
    version: PROGRESS_STATE_VERSION,
    attempts: [],
    lessons: [],
    sessions: [],
    reviewQueue: [],
    studyDays: [],
  };
}

/* ───────────────────────────────────────────────────────── user preferences */

/**
 * `subjectLevels` is keyed by subject id, which is an open set — new subjects
 * are data, not code. So preferences are validated by the tolerant parser
 * below rather than by a fixed schema: a corrupted or half-migrated value
 * should degrade to a default, never block the app from starting.
 */
export interface UserPreferences {
  subjects: string[];
  subjectLevels: Record<string, Level>;
  dailyGoalMinutes: number;
  darkMode: boolean;
  remindersEnabled: boolean;
  onboarded: boolean;
  /** Language of the app's own copy — buttons, labels, screen titles. */
  interfaceLanguage: Language;
  /**
   * Language lessons are delivered in. Deliberately separate from the
   * interface: studying English with a Polish interface is the normal case,
   * not an edge one.
   */
  contentLanguage: Language;
}

export const DAILY_GOAL_OPTIONS = [5, 10, 15, 20] as const;

export function defaultPreferences(detected: Language = DEFAULT_LANGUAGE): UserPreferences {
  return {
    subjects: [],
    subjectLevels: {},
    dailyGoalMinutes: 10,
    darkMode: false,
    remindersEnabled: true,
    onboarded: false,
    interfaceLanguage: detected,
    contentLanguage: detected,
  };
}

/** Best guess from the browser, used only for the very first launch. */
export function detectLanguage(candidates: readonly string[] = []): Language {
  for (const candidate of candidates) {
    const tag = candidate.toLowerCase().split('-')[0] ?? '';
    if ((LANGUAGES as readonly string[]).includes(tag)) return tag as Language;
  }
  return DEFAULT_LANGUAGE;
}

/** Tolerant parser: unknown shapes fall back to defaults rather than throwing. */
export function parseUserPreferences(value: unknown): UserPreferences {
  const base = defaultPreferences();
  if (typeof value !== 'object' || value === null) return base;
  const raw = value as Record<string, unknown>;

  const subjects = Array.isArray(raw.subjects) ? raw.subjects.filter((s): s is string => typeof s === 'string') : [];

  const subjectLevels: Record<string, Level> = {};
  if (typeof raw.subjectLevels === 'object' && raw.subjectLevels !== null) {
    for (const [key, level] of Object.entries(raw.subjectLevels as Record<string, unknown>)) {
      if (typeof level === 'string' && (LEVELS as readonly string[]).includes(level)) {
        subjectLevels[key] = level as Level;
      }
    }
  }

  const goal = raw.dailyGoalMinutes;
  const language = (value: unknown, fallback: Language): Language =>
    typeof value === 'string' && (LANGUAGES as readonly string[]).includes(value) ? (value as Language) : fallback;

  return {
    subjects,
    subjectLevels,
    dailyGoalMinutes: typeof goal === 'number' && goal > 0 && goal <= 240 ? Math.round(goal) : base.dailyGoalMinutes,
    darkMode: typeof raw.darkMode === 'boolean' ? raw.darkMode : base.darkMode,
    remindersEnabled: typeof raw.remindersEnabled === 'boolean' ? raw.remindersEnabled : base.remindersEnabled,
    onboarded: typeof raw.onboarded === 'boolean' ? raw.onboarded : base.onboarded,
    interfaceLanguage: language(raw.interfaceLanguage, base.interfaceLanguage),
    contentLanguage: language(raw.contentLanguage, base.contentLanguage),
  };
}
