/**
 * The validation gate in the content pipeline:
 *
 *   AI content generator → JSON → **validation** → storage → repository → UI
 *
 * Every lesson passes through here before anything renders it. Beyond the
 * per-lesson schema, this step checks the things a single file cannot know
 * about itself: that its subject and module exist, that the module lists it,
 * that ids are unique across the catalogue, that the seed content meets the
 * editorial minimums — and, for translations, that a localised lesson is
 * *structurally identical* to its English original.
 *
 * That last rule is what makes switching content language safe: progress,
 * attempts and the review queue are keyed by exercise id and tag, so a Polish
 * lesson that renamed an id would silently orphan the learner's history.
 */
import {
  CatalogTranslationSchema,
  LessonSchema,
  ModuleCatalogSchema,
  SubjectCatalogSchema,
  type CatalogTranslation,
  type Language,
  type Lesson,
  type Module,
  type Subject,
} from '../domain/schema.ts';
import { formatIssues, ValidationError, type Issue } from '../domain/validation.ts';

export interface Catalog {
  subjects: Subject[];
  modules: Module[];
  lessons: Lesson[];
}

export interface CatalogProblem {
  /** Lesson name / file the problem belongs to, or `catalog` for global ones. */
  source: string;
  issues: Issue[];
}

export interface RawContent {
  subjects: unknown;
  modules: unknown;
  lessons: Record<string, unknown>;
  /** Per-language overlays. English is the base and needs no entry. */
  translations?: Partial<Record<Language, { catalog?: unknown; lessons?: Record<string, unknown> }>>;
}

export interface CatalogValidation {
  /** Fully resolved catalogue per language; missing translations fall back. */
  catalogs: Record<Language, Catalog>;
  /** Lesson ids that really have a translation, per language. */
  localizedLessons: Record<Language, Set<string>>;
  problems: CatalogProblem[];
}

/** Editorial minimums the seed content is required to hit (spec §26). */
export const CONTENT_RULES = {
  minExercisesPerLesson: 8,
  minExerciseTypesPerLesson: 3,
  minLessonsPerModule: 3,
} as const;

/**
 * Validates raw content and returns a resolved catalogue per language plus
 * every problem found. Callers decide what to do: the build script fails, the
 * app drops the offending lesson and carries on.
 */
export function validateCatalog(raw: RawContent): CatalogValidation {
  const problems: CatalogProblem[] = [];

  const subjectsResult = SubjectCatalogSchema.safeParse(raw.subjects);
  if (!subjectsResult.success) problems.push({ source: 'subjects.json', issues: subjectsResult.issues });
  const subjects = subjectsResult.success ? subjectsResult.data : [];

  const modulesResult = ModuleCatalogSchema.safeParse(raw.modules);
  if (!modulesResult.success) problems.push({ source: 'modules.json', issues: modulesResult.issues });
  const modules = modulesResult.success ? modulesResult.data : [];

  const lessons: Lesson[] = [];
  for (const [name, value] of Object.entries(raw.lessons)) {
    const result = LessonSchema.safeParse(value);
    if (!result.success) {
      problems.push({ source: `lessons/${name}.json`, issues: result.issues });
      continue;
    }
    lessons.push(result.data);
  }

  const base: Catalog = { subjects, modules, lessons };
  problems.push(...crossCheck(base, 'en'));

  const catalogs: Record<Language, Catalog> = { en: base, pl: base };
  const localizedLessons: Record<Language, Set<string>> = { en: new Set(lessons.map((l) => l.id)), pl: new Set() };

  for (const [language, overlay] of Object.entries(raw.translations ?? {})) {
    const lang = language as Language;
    if (lang === 'en' || !overlay) continue;

    let translation: CatalogTranslation = { subjects: {}, modules: {} };
    if (overlay.catalog !== undefined) {
      const parsed = CatalogTranslationSchema.safeParse(overlay.catalog);
      if (parsed.success) translation = parsed.data;
      else problems.push({ source: `${lang}/catalog.json`, issues: parsed.issues });
    }

    const translated = new Map<string, Lesson>();
    for (const [name, value] of Object.entries(overlay.lessons ?? {})) {
      const result = LessonSchema.safeParse(value);
      if (!result.success) {
        problems.push({ source: `${lang}/lessons/${name}.json`, issues: result.issues });
        continue;
      }
      const original = lessons.find((l) => l.id === result.data.id);
      if (!original) {
        problems.push({
          source: `${lang}/lessons/${name}.json`,
          issues: [{ path: ['id'], message: `no English lesson with id "${result.data.id}" to translate` }],
        });
        continue;
      }
      const parityIssues = checkTranslationParity(original, result.data);
      if (parityIssues.length > 0) {
        problems.push({ source: `${lang}/lessons/${name}.json`, issues: parityIssues });
        continue;
      }
      translated.set(result.data.id, result.data);
    }

    catalogs[lang] = applyTranslation(base, translation, translated);
    localizedLessons[lang] = new Set(translated.keys());
  }

  return { catalogs, localizedLessons, problems };
}

/** Builds a complete catalogue in one language, falling back to English. */
function applyTranslation(base: Catalog, translation: CatalogTranslation, lessons: Map<string, Lesson>): Catalog {
  return {
    subjects: base.subjects.map((subject) => {
      const patch = translation.subjects[subject.id];
      return patch ? { ...subject, ...definedOnly(patch) } : subject;
    }),
    modules: base.modules.map((module) => {
      const patch = translation.modules[module.id];
      return patch ? { ...module, ...definedOnly(patch) } : module;
    }),
    lessons: base.lessons.map((lesson) => lessons.get(lesson.id) ?? lesson),
  };
}

function definedOnly<T extends object>(patch: T): Partial<T> {
  return Object.fromEntries(Object.entries(patch).filter(([, value]) => value !== undefined)) as Partial<T>;
}

/**
 * A translation may change every string, and nothing else. Ids, order, types,
 * tags, difficulty and answer ids are the learner's progress keys and the
 * analytics dimensions — they must be identical in every language.
 */
function checkTranslationParity(original: Lesson, translated: Lesson): Issue[] {
  const issues: Issue[] = [];
  const add = (message: string, path: (string | number)[] = []) => issues.push({ path, message });

  if (original.subject !== translated.subject) add(`subject must stay "${original.subject}"`, ['subject']);
  if (original.module !== translated.module) add(`module must stay "${original.module}"`, ['module']);
  if (original.level !== translated.level) add(`level must stay "${original.level}"`, ['level']);

  const originalIds = original.exercises.map((e) => e.id);
  const translatedIds = translated.exercises.map((e) => e.id);
  if (originalIds.join('|') !== translatedIds.join('|')) {
    add(
      `exercise ids and order must match the English lesson exactly — progress is keyed by them.\n      expected: ${originalIds.join(', ')}\n      received: ${translatedIds.join(', ')}`,
      ['exercises'],
    );
    return issues;
  }

  original.exercises.forEach((source, index) => {
    const target = translated.exercises[index];
    if (!target) return;
    const at = (field: string) => ['exercises', index, field];

    if (source.type !== target.type) add(`type must stay "${source.type}"`, at('type'));
    if (source.difficulty !== target.difficulty) add(`difficulty must stay ${source.difficulty}`, at('difficulty'));
    if (source.tags.join('|') !== target.tags.join('|')) {
      add(`tags must stay [${source.tags.join(', ')}] — they are the analytics keys`, at('tags'));
    }

    const sourceAnswers = 'answers' in source ? source.answers : null;
    const targetAnswers = 'answers' in target ? target.answers : null;
    if (sourceAnswers && targetAnswers) {
      if (sourceAnswers.map((a) => a.id).join('|') !== targetAnswers.map((a) => a.id).join('|')) {
        add('answer ids and their order must match the English lesson', at('answers'));
      }
      if ('correctAnswer' in source && 'correctAnswer' in target && source.correctAnswer !== target.correctAnswer) {
        add(`correctAnswer must stay "${String(source.correctAnswer)}"`, at('correctAnswer'));
      }
    }
    if (source.type === 'true_false' && target.type === 'true_false' && source.correctAnswer !== target.correctAnswer) {
      add(`correctAnswer must stay ${String(source.correctAnswer)}`, at('correctAnswer'));
    }
  });

  return issues;
}

/** Referential integrity and editorial rules that span more than one file. */
function crossCheck(catalog: Catalog, language: Language): CatalogProblem[] {
  const { subjects, modules, lessons } = catalog;
  const problems: CatalogProblem[] = [];
  const prefix = language === 'en' ? '' : `${language}/`;
  const add = (source: string, message: string, path: (string | number)[] = []) =>
    problems.push({ source, issues: [{ path, message }] });

  const subjectIds = new Set(subjects.map((s) => s.id));
  const moduleById = new Map(modules.map((m) => [m.id, m]));
  const lessonById = new Map(lessons.map((l) => [l.id, l]));

  duplicates(subjects.map((s) => s.id)).forEach((id) => add('subjects.json', `duplicate subject id: ${id}`));
  duplicates(modules.map((m) => m.id)).forEach((id) => add('modules.json', `duplicate module id: ${id}`));
  duplicates(lessons.map((l) => l.id)).forEach((id) => add('catalog', `duplicate lesson id: ${id}`));

  const seenExerciseIds = new Map<string, string>();
  for (const lesson of lessons) {
    const source = `${prefix}lessons/${lesson.id}.json`;

    if (!subjectIds.has(lesson.subject)) add(source, `unknown subject "${lesson.subject}"`, ['subject']);

    const module = moduleById.get(lesson.module);
    if (!module) {
      add(source, `unknown module "${lesson.module}"`, ['module']);
    } else {
      if (module.subject !== lesson.subject) {
        add(source, `module "${module.id}" belongs to subject "${module.subject}"`, ['module']);
      }
      if (!module.lessonIds.includes(lesson.id)) {
        add(source, `module "${module.id}" does not list this lesson in lessonIds`, ['id']);
      }
    }

    if (lesson.exercises.length < CONTENT_RULES.minExercisesPerLesson) {
      add(
        source,
        `needs at least ${CONTENT_RULES.minExercisesPerLesson} exercises (has ${lesson.exercises.length})`,
        ['exercises'],
      );
    }
    const typeCount = new Set(lesson.exercises.map((e) => e.type)).size;
    if (typeCount < CONTENT_RULES.minExerciseTypesPerLesson) {
      add(
        source,
        `needs at least ${CONTENT_RULES.minExerciseTypesPerLesson} distinct exercise types (has ${typeCount})`,
        ['exercises'],
      );
    }

    for (const exercise of lesson.exercises) {
      const owner = seenExerciseIds.get(exercise.id);
      if (owner) add(source, `exercise id "${exercise.id}" is already used in ${owner}`, ['exercises']);
      else seenExerciseIds.set(exercise.id, lesson.id);
    }
  }

  for (const module of modules) {
    const source = 'modules.json';
    if (!subjectIds.has(module.subject)) add(source, `module "${module.id}" has unknown subject "${module.subject}"`);
    for (const lessonId of module.lessonIds) {
      if (!lessonById.has(lessonId)) add(source, `module "${module.id}" lists missing lesson "${lessonId}"`);
    }
    if (module.lessonIds.length < CONTENT_RULES.minLessonsPerModule) {
      add(
        source,
        `module "${module.id}" needs at least ${CONTENT_RULES.minLessonsPerModule} lessons (has ${module.lessonIds.length})`,
      );
    }
  }

  return problems;
}

function duplicates(values: string[]): string[] {
  return [...new Set(values.filter((value, index) => values.indexOf(value) !== index))];
}

/** Human-readable report, shared by the CLI validator and the dev console. */
export function formatProblems(problems: CatalogProblem[]): string {
  return problems.map((p) => `${p.source}\n${formatIssues(p.issues)}`).join('\n\n');
}

/** Strict variant: throws unless the catalogue is completely clean. */
export function assertValidCatalog(raw: RawContent): Record<Language, Catalog> {
  const { catalogs, problems } = validateCatalog(raw);
  if (problems.length > 0) {
    throw new ValidationError(
      `content validation failed (${problems.length} problem${problems.length === 1 ? '' : 's'})`,
      problems.flatMap((p) => p.issues.map((i) => ({ ...i, path: [p.source, ...i.path] }))),
    );
  }
  return catalogs;
}
