/**
 * The content boundary.
 *
 * Everything above this interface (screens, session engine, review queue) is
 * written against `ContentRepository` and never against a file, a fetch call or
 * a database client. The MVP ships `LocalContentRepository`, which reads
 * bundled JSON; a `HttpContentRepository` or a Supabase-backed one can replace
 * it without a single change above.
 *
 * Every read takes a `Language`. Translations are content, not a UI concern:
 * the repository resolves the requested language and falls back to English
 * when a lesson has no translation yet, so a half-translated catalogue is a
 * normal state rather than a broken one.
 */
import type { Exercise, Language, Lesson, Level, Module, Subject } from '../domain/schema.ts';

export interface ContentRepository {
  /** Every subject the catalogue offers, in display order. */
  getSubjects(language?: Language): Promise<Subject[]>;

  getSubject(subjectId: string, language?: Language): Promise<Subject | null>;

  /**
   * Modules for a subject that the learner's level unlocks. A learner at
   * `intermediate` sees beginner modules too — level gates the ceiling, not
   * the floor.
   */
  getModules(subjectId: string, level: Level, language?: Language): Promise<Module[]>;

  getModule(moduleId: string, language?: Language): Promise<Module | null>;

  /** Lessons of a module, in the module's own `lessonIds` order. */
  getLessons(moduleId: string, language?: Language): Promise<Lesson[]>;

  getLesson(lessonId: string, language?: Language): Promise<Lesson | null>;

  getExercises(lessonId: string, language?: Language): Promise<Exercise[]>;

  /**
   * Look one exercise up across the whole catalogue. The review queue stores
   * exercise ids only, so it needs this to rebuild a session — and because
   * ids are identical in every language, a queue built in English replays
   * correctly in Polish.
   */
  getExercise(exerciseId: string, language?: Language): Promise<ExerciseRef | null>;

  /**
   * Whether this lesson genuinely exists in that language, or is being served
   * as an English fallback. The UI badges the difference rather than hiding it.
   */
  isLessonLocalized(lessonId: string, language: Language): boolean;

  /**
   * Pull a lesson into local storage so it can be practised offline. The local
   * implementation is a no-op (everything is bundled already); a remote one
   * fetches and caches.
   */
  prefetchLesson?(lessonId: string, language?: Language): Promise<void>;
}

/** An exercise plus the lesson it came from — the review queue needs both. */
export interface ExerciseRef {
  exercise: Exercise;
  lessonId: string;
  lessonTitle: string;
  subjectId: string;
  moduleId: string;
}
