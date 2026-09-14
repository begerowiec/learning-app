/**
 * The MVP content repository: bundled JSON, validated once at construction,
 * indexed per language.
 *
 * It is deliberately async even though nothing here awaits anything — that way
 * swapping in an HTTP- or Supabase-backed implementation is a constructor
 * change and nothing else. Because all content ships with the bundle, lessons
 * are fully playable offline in every language; `prefetchLesson` exists only so
 * a remote implementation has a place to put its caching.
 */
import {
  DEFAULT_LANGUAGE,
  levelAtLeast,
  type Exercise,
  type Language,
  type Lesson,
  type Level,
  type Module,
  type Subject,
} from '../domain/schema.ts';
import type { ContentRepository, ExerciseRef } from './ContentRepository.ts';
import { rawContent } from './source.ts';
import { validateCatalog, type Catalog, type CatalogProblem } from './validateCatalog.ts';

export interface LocalContentRepositoryOptions {
  /** Called once with anything the validator rejected. */
  onProblems?: (problems: CatalogProblem[]) => void;
}

/** Everything the repository needs to answer questions about one language. */
interface LanguageIndex {
  subjects: Subject[];
  modules: Module[];
  lessons: Map<string, Lesson>;
  exercises: Map<string, ExerciseRef>;
}

export class LocalContentRepository implements ContentRepository {
  private readonly indexes: Map<Language, LanguageIndex>;
  private readonly localized: Record<Language, Set<string>>;
  readonly problems: CatalogProblem[];

  constructor(
    catalogs: Record<Language, Catalog>,
    localized: Record<Language, Set<string>>,
    problems: CatalogProblem[] = [],
  ) {
    this.problems = problems;
    this.localized = localized;
    this.indexes = new Map(
      (Object.entries(catalogs) as [Language, Catalog][]).map(([language, catalog]) => [language, buildIndex(catalog)]),
    );
  }

  /**
   * Builds the repository from the bundled content. Invalid lessons are
   * dropped rather than crashing the app — a single bad generated file must
   * not take the whole catalogue down — and reported through `onProblems`.
   */
  static fromBundledContent(options: LocalContentRepositoryOptions = {}): LocalContentRepository {
    const { catalogs, localizedLessons, problems } = validateCatalog(rawContent);
    if (problems.length > 0) options.onProblems?.(problems);
    return new LocalContentRepository(catalogs, localizedLessons, problems);
  }

  private index(language: Language = DEFAULT_LANGUAGE): LanguageIndex {
    return this.indexes.get(language) ?? this.indexes.get(DEFAULT_LANGUAGE) ?? emptyIndex();
  }

  async getSubjects(language?: Language): Promise<Subject[]> {
    return this.index(language).subjects;
  }

  async getSubject(subjectId: string, language?: Language): Promise<Subject | null> {
    return this.index(language).subjects.find((s) => s.id === subjectId) ?? null;
  }

  async getModules(subjectId: string, level: Level, language?: Language): Promise<Module[]> {
    return this.index(language).modules.filter((m) => m.subject === subjectId && levelAtLeast(level, m.level));
  }

  async getModule(moduleId: string, language?: Language): Promise<Module | null> {
    return this.index(language).modules.find((m) => m.id === moduleId) ?? null;
  }

  async getLessons(moduleId: string, language?: Language): Promise<Lesson[]> {
    const index = this.index(language);
    const module = index.modules.find((m) => m.id === moduleId);
    if (!module) return [];
    return module.lessonIds.map((id) => index.lessons.get(id)).filter((l): l is Lesson => l !== undefined);
  }

  async getLesson(lessonId: string, language?: Language): Promise<Lesson | null> {
    return this.index(language).lessons.get(lessonId) ?? null;
  }

  async getExercises(lessonId: string, language?: Language): Promise<Exercise[]> {
    return this.index(language).lessons.get(lessonId)?.exercises ?? [];
  }

  async getExercise(exerciseId: string, language?: Language): Promise<ExerciseRef | null> {
    return this.index(language).exercises.get(exerciseId) ?? null;
  }

  isLessonLocalized(lessonId: string, language: Language): boolean {
    return this.localized[language]?.has(lessonId) ?? false;
  }

  /** Lesson ids served as an English fallback in this language. */
  untranslatedLessons(language: Language): string[] {
    return [...this.index(language).lessons.keys()].filter((id) => !this.isLessonLocalized(id, language));
  }

  async prefetchLesson(): Promise<void> {
    /* Everything is bundled — nothing to fetch. */
  }
}

function buildIndex(catalog: Catalog): LanguageIndex {
  const exercises = new Map<string, ExerciseRef>();
  for (const lesson of catalog.lessons) {
    for (const exercise of lesson.exercises) {
      exercises.set(exercise.id, {
        exercise,
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        subjectId: lesson.subject,
        moduleId: lesson.module,
      });
    }
  }
  return {
    subjects: [...catalog.subjects].sort((a, b) => a.order - b.order),
    modules: [...catalog.modules].sort((a, b) => a.order - b.order),
    lessons: new Map(catalog.lessons.map((lesson) => [lesson.id, lesson])),
    exercises,
  };
}

function emptyIndex(): LanguageIndex {
  return { subjects: [], modules: [], lessons: new Map(), exercises: new Map() };
}
