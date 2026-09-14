import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { LocalContentRepository } from '../../src/core/content/LocalContentRepository.ts';
import { CONTENT_RULES, formatProblems, validateCatalog } from '../../src/core/content/validateCatalog.ts';
import { EXERCISE_TYPES } from '../../src/core/domain/schema.ts';
import { LearningService } from '../../src/core/LearningService.ts';
import { ProgressService } from '../../src/core/progress/ProgressService.ts';
import { MemoryProgressStore } from '../../src/core/progress/ProgressStore.ts';

const contentDir = path.join(process.cwd(), 'src/content');
const readJson = (file: string): unknown => JSON.parse(fs.readFileSync(file, 'utf8')) as unknown;

const lessons: Record<string, unknown> = {};
for (const file of fs.readdirSync(path.join(contentDir, 'lessons'))) {
  if (file.endsWith('.json')) lessons[path.basename(file, '.json')] = readJson(path.join(contentDir, 'lessons', file));
}

function readLessons(dir: string): Record<string, unknown> {
  if (!fs.existsSync(dir)) return {};
  const out: Record<string, unknown> = {};
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.json'))) {
    out[path.basename(file, '.json')] = readJson(path.join(dir, file));
  }
  return out;
}

const { catalogs, localizedLessons, problems } = validateCatalog({
  subjects: readJson(path.join(contentDir, 'subjects.json')),
  modules: readJson(path.join(contentDir, 'modules.json')),
  lessons,
  translations: {
    pl: {
      catalog: readJson(path.join(contentDir, 'pl/catalog.json')),
      lessons: readLessons(path.join(contentDir, 'pl/lessons')),
    },
  },
});
const catalog = catalogs.en;

describe('seed content', () => {
  test('validates with no problems', () => {
    assert.equal(problems.length, 0, problems.length ? formatProblems(problems) : '');
  });

  test('covers every subject with two modules each', () => {
    assert.ok(catalog.subjects.length >= 3);
    for (const subject of catalog.subjects) {
      const modules = catalog.modules.filter((m) => m.subject === subject.id);
      assert.equal(modules.length, 2, `${subject.id} should have 2 modules`);
      for (const module of modules) {
        assert.ok(
          module.lessonIds.length >= CONTENT_RULES.minLessonsPerModule,
          `${module.id} should have at least ${CONTENT_RULES.minLessonsPerModule} lessons`,
        );
      }
    }
  });

  test('every lesson meets the editorial minimums', () => {
    for (const lesson of catalog.lessons) {
      assert.ok(lesson.exercises.length >= CONTENT_RULES.minExercisesPerLesson, `${lesson.id}: too few exercises`);
      const types = new Set(lesson.exercises.map((e) => e.type));
      assert.ok(types.size >= CONTENT_RULES.minExerciseTypesPerLesson, `${lesson.id}: too few exercise types`);
      assert.ok(lesson.content.length > 0, `${lesson.id}: no theory`);
    }
  });

  test('exercises every supported type at least once', () => {
    const used = new Set(catalog.lessons.flatMap((l) => l.exercises.map((e) => e.type)));
    for (const type of EXERCISE_TYPES) assert.ok(used.has(type), `no seed content for ${type}`);
  });

  test('the correct answer is not always in the same position', () => {
    const positions = new Map<number, number>();
    for (const lesson of catalog.lessons) {
      for (const exercise of lesson.exercises) {
        if (!('answers' in exercise)) continue;
        const index = exercise.answers.findIndex((a) => a.id === exercise.correctAnswer);
        positions.set(index, (positions.get(index) ?? 0) + 1);
      }
    }
    const counts = [...positions.values()];
    const total = counts.reduce((a, b) => a + b, 0);
    // No single slot may hold more than half the answers.
    assert.ok(Math.max(...counts) < total * 0.5, `answer positions are skewed: ${JSON.stringify([...positions])}`);
  });

  test('every exercise carries tags and a difficulty in range', () => {
    for (const lesson of catalog.lessons) {
      for (const exercise of lesson.exercises) {
        assert.ok(exercise.tags.length > 0, `${exercise.id}: no tags`);
        assert.ok(exercise.difficulty >= 1 && exercise.difficulty <= 5, `${exercise.id}: bad difficulty`);
        assert.ok(exercise.explanation.length > 10, `${exercise.id}: thin explanation`);
      }
    }
  });
});

describe('content repository', () => {
  const repository = new LocalContentRepository(catalogs, localizedLessons);

  test('gates modules on the learner level, cumulatively', async () => {
    const beginner = await repository.getModules('python', 'beginner');
    const intermediate = await repository.getModules('python', 'intermediate');
    assert.equal(beginner.length, 1);
    assert.equal(intermediate.length, 2);
  });

  test('returns lessons in the module order', async () => {
    const module = await repository.getModule('python-basics');
    const list = await repository.getLessons('python-basics');
    assert.deepEqual(
      list.map((l) => l.id),
      module?.lessonIds,
    );
  });

  test('finds any exercise across the whole catalogue', async () => {
    const ref = await repository.getExercise('python-functions-001');
    assert.equal(ref?.lessonId, 'python-functions');
    assert.equal(ref?.subjectId, 'python');
  });

  test('returns null rather than throwing for unknown ids', async () => {
    assert.equal(await repository.getLesson('nope'), null);
    assert.equal(await repository.getExercise('nope'), null);
    assert.deepEqual(await repository.getLessons('nope'), []);
  });
});

describe('learning service', () => {
  function makeService() {
    const repository = new LocalContentRepository(catalogs, localizedLessons);
    const progress = new ProgressService(new MemoryProgressStore());
    progress.updatePreferences({
      subjects: ['python'],
      subjectLevels: { python: 'beginner' },
      onboarded: true,
    });
    return { learning: new LearningService(repository, progress), progress };
  }

  test('home recommends the first lesson for a new learner', async () => {
    const { learning } = makeService();
    const home = await learning.getHomeView();
    assert.equal(home.recommendation.kind, 'next_lesson');
    assert.equal(home.dueReviewCount, 0);
  });

  test('a lesson session resumes where the learner stopped', async () => {
    const { learning, progress } = makeService();
    const first = await learning.buildLessonSession('python-variables');
    assert.equal(first?.startIndex, 0);

    progress.startLesson({
      lessonId: 'python-variables',
      subjectId: 'python',
      moduleId: 'python-basics',
      level: 'beginner',
      totalExercises: first?.items.length ?? 0,
    });
    const exercise = first?.items[0]?.exercise;
    assert.ok(exercise);
    if (exercise) progress.recordAttempt({ exercise, lessonId: 'python-variables', subjectId: 'python', correct: true, durationSeconds: 5 });

    const resumed = await learning.buildLessonSession('python-variables');
    assert.equal(resumed?.startIndex, 1);
  });

  test('a wrong answer produces a review session with that exercise in it', async () => {
    const { learning, progress } = makeService();
    const built = await learning.buildLessonSession('python-variables');
    const exercise = built?.items[0]?.exercise;
    assert.ok(exercise);
    if (!exercise) return;

    progress.recordAttempt({ exercise, lessonId: 'python-variables', subjectId: 'python', correct: false, durationSeconds: 5 });

    // Due tomorrow, so nothing is ready now …
    assert.equal((await learning.buildReviewSession(10)).length, 0);

    // … and ready once the interval has passed.
    const tomorrow = new Date(Date.now() + 2 * 86_400_000);
    const items = await learning.buildReviewSession(10, tomorrow);
    assert.equal(items.length, 1);
    assert.equal(items[0]?.exercise.id, exercise.id);
    assert.ok(items[0]?.note);
  });
});
