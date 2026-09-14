import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { LANGUAGES, type Language } from '../../src/core/domain/schema.ts';
import { detectLanguage, parseUserPreferences } from '../../src/core/progress/models.ts';
import { createTranslator, localeOf, pluralIndex, weekdayLetters } from '../../src/ui/i18n/index.ts';
import { UI_STRINGS } from '../../src/ui/i18n/strings.ts';
import { LocalContentRepository } from '../../src/core/content/LocalContentRepository.ts';
import { validateCatalog } from '../../src/core/content/validateCatalog.ts';

describe('interface strings', () => {
  test('every key is filled in for every language', () => {
    const missing: string[] = [];
    for (const [key, entry] of Object.entries(UI_STRINGS)) {
      for (const language of LANGUAGES) {
        const value = (entry as Record<string, string>)[language];
        if (!value || value.trim().length === 0) missing.push(`${key}.${language}`);
      }
    }
    assert.deepEqual(missing, []);
  });

  test('plural entries have the right number of forms per language', () => {
    for (const [key, entry] of Object.entries(UI_STRINGS)) {
      if (!key.startsWith('unit.')) continue;
      assert.equal((entry as Record<string, string>).en?.split('|').length, 2, `${key}: English needs 2 forms`);
      assert.equal((entry as Record<string, string>).pl?.split('|').length, 3, `${key}: Polish needs 3 forms`);
    }
  });

  test('no placeholder is left unsubstituted in a translation', () => {
    for (const [key, entry] of Object.entries(UI_STRINGS)) {
      const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
      const english = placeholders((entry as Record<string, string>).en ?? '');
      for (const language of LANGUAGES) {
        if (language === 'en') continue;
        assert.deepEqual(
          placeholders((entry as Record<string, string>)[language] ?? ''),
          english,
          `${key}: ${language} placeholders differ from English`,
        );
      }
    }
  });
});

describe('translator', () => {
  test('substitutes parameters', () => {
    const t = createTranslator('en');
    assert.equal(t.t('onboarding.step', { current: 2, total: 3 }), 'Step 2 / 3');
  });

  test('leaves an unknown placeholder alone rather than printing undefined', () => {
    const t = createTranslator('en');
    assert.equal(t.t('home.daysAgo', {}), '{count} days ago');
  });

  test('English plurals: one vs other', () => {
    const t = createTranslator('en');
    assert.equal(t.tc('unit.lesson', 1), '1 lesson');
    assert.equal(t.tc('unit.lesson', 3), '3 lessons');
  });

  test('Polish plurals: one, few and many', () => {
    const t = createTranslator('pl');
    assert.equal(t.tc('unit.lesson', 1), '1 lekcja');
    assert.equal(t.tc('unit.lesson', 3), '3 lekcje');
    assert.equal(t.tc('unit.lesson', 5), '5 lekcji');
    // 12–14 are the exception to the 2–4 rule.
    assert.equal(t.tc('unit.lesson', 12), '12 lekcji');
    assert.equal(t.tc('unit.lesson', 22), '22 lekcje');
  });

  test('plural index is stable for the teens', () => {
    for (const n of [12, 13, 14, 112, 113]) assert.equal(pluralIndex('pl', n), 2, `${n}`);
    for (const n of [2, 3, 4, 22, 33]) assert.equal(pluralIndex('pl', n), 1, `${n}`);
  });

  test('weekday letters start on Monday and follow the language', () => {
    assert.equal(weekdayLetters('en').length, 7);
    assert.equal(localeOf('pl'), 'pl-PL');
    assert.notDeepEqual(weekdayLetters('pl'), weekdayLetters('en'));
  });
});

describe('language preferences', () => {
  test('detects the browser language, falling back to English', () => {
    assert.equal(detectLanguage(['pl-PL', 'en-GB']), 'pl');
    assert.equal(detectLanguage(['de-DE', 'en-US']), 'en');
    assert.equal(detectLanguage([]), 'en');
  });

  test('interface and content language are stored independently', () => {
    const prefs = parseUserPreferences({ interfaceLanguage: 'pl', contentLanguage: 'en' });
    assert.equal(prefs.interfaceLanguage, 'pl');
    assert.equal(prefs.contentLanguage, 'en');
  });

  test('an unknown language in stored preferences degrades to the default', () => {
    const prefs = parseUserPreferences({ interfaceLanguage: 'klingon' });
    assert.equal(prefs.interfaceLanguage, 'en');
  });
});

/* ───────────────────────────────────────────────── content in two languages */

const contentDir = path.join(process.cwd(), 'src/content');
const readJson = (file: string): unknown => JSON.parse(fs.readFileSync(file, 'utf8')) as unknown;
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
  lessons: readLessons(path.join(contentDir, 'lessons')),
  translations: {
    pl: {
      catalog: readJson(path.join(contentDir, 'pl/catalog.json')),
      lessons: readLessons(path.join(contentDir, 'pl/lessons')),
    },
  },
});

describe('translated catalogue', () => {
  test('validates with no problems', () => {
    assert.deepEqual(problems, []);
  });

  test('the Polish catalogue has the same lessons as the English one', () => {
    assert.deepEqual(
      catalogs.pl.lessons.map((l) => l.id).sort(),
      catalogs.en.lessons.map((l) => l.id).sort(),
    );
  });

  test('exercise ids, order, tags and answers are identical across languages', () => {
    for (const source of catalogs.en.lessons) {
      const translated = catalogs.pl.lessons.find((l) => l.id === source.id);
      assert.ok(translated, `${source.id} missing in pl`);
      if (!translated) continue;

      assert.deepEqual(
        translated.exercises.map((e) => e.id),
        source.exercises.map((e) => e.id),
        `${source.id}: exercise ids drifted`,
      );
      source.exercises.forEach((exercise, i) => {
        const other = translated.exercises[i];
        assert.equal(other?.type, exercise.type, `${exercise.id}: type`);
        assert.deepEqual(other?.tags, exercise.tags, `${exercise.id}: tags`);
        assert.equal(other?.difficulty, exercise.difficulty, `${exercise.id}: difficulty`);
        if ('answers' in exercise && other && 'answers' in other) {
          assert.deepEqual(
            other.answers.map((a) => a.id),
            exercise.answers.map((a) => a.id),
            `${exercise.id}: answer ids`,
          );
          assert.equal(other.correctAnswer, exercise.correctAnswer, `${exercise.id}: correctAnswer`);
        }
      });
    }
  });

  test('programming lessons are actually translated, not just copied', () => {
    for (const id of ['python-variables', 'typescript-generics', 'playwright-locator-strategy']) {
      const source = catalogs.en.lessons.find((l) => l.id === id);
      const translated = catalogs.pl.lessons.find((l) => l.id === id);
      assert.notEqual(translated?.title, source?.title, `${id}: title not translated`);
      assert.notEqual(translated?.content[0]?.body, source?.content[0]?.body, `${id}: theory not translated`);
    }
  });

  test('English lessons keep their study material in English', () => {
    const source = catalogs.en.lessons.find((l) => l.id === 'english-present-perfect');
    const translated = catalogs.pl.lessons.find((l) => l.id === 'english-present-perfect');
    const sourceFill = source?.exercises.find((e) => e.id === 'english-pp-001');
    const translatedFill = translated?.exercises.find((e) => e.id === 'english-pp-001');

    assert.ok(sourceFill && translatedFill && 'sentence' in sourceFill && 'sentence' in translatedFill);
    if (sourceFill && translatedFill && 'sentence' in sourceFill && 'sentence' in translatedFill) {
      // The sentence being studied is the material — it must not be translated.
      assert.equal(translatedFill.sentence, sourceFill.sentence);
      // The instruction around it must be.
      assert.notEqual(translatedFill.question, sourceFill.question);
    }
  });

  test('every subject and module has Polish copy', () => {
    for (const subject of catalogs.pl.subjects) {
      const original = catalogs.en.subjects.find((s) => s.id === subject.id);
      assert.notEqual(subject.description, original?.description, `${subject.id}: description not translated`);
    }
    for (const module of catalogs.pl.modules) {
      const original = catalogs.en.modules.find((m) => m.id === module.id);
      assert.notEqual(module.title, original?.title, `${module.id}: title not translated`);
    }
  });
});

describe('language-aware repository', () => {
  const repository = new LocalContentRepository(catalogs, localizedLessons);

  test('serves a lesson in the requested language', async () => {
    const en = await repository.getLesson('python-variables', 'en');
    const pl = await repository.getLesson('python-variables', 'pl');
    assert.equal(en?.title, 'Variables & Data Types');
    assert.equal(pl?.title, 'Zmienne i typy danych');
  });

  test('exercise ids resolve in either language, so the review queue survives a switch', async () => {
    const en = await repository.getExercise('python-variables-001', 'en');
    const pl = await repository.getExercise('python-variables-001', 'pl');
    assert.equal(en?.lessonId, pl?.lessonId);
    assert.notEqual(en?.exercise.explanation, pl?.exercise.explanation);
  });

  test('defaults to English when no language is given', async () => {
    const lesson = await repository.getLesson('python-variables');
    assert.equal(lesson?.title, 'Variables & Data Types');
  });

  test('reports which lessons are genuinely localised', () => {
    assert.equal(repository.isLessonLocalized('python-variables', 'pl'), true);
    assert.deepEqual(repository.untranslatedLessons('pl'), []);
  });

  test('an untranslated lesson falls back to English rather than disappearing', async () => {
    const partial = new LocalContentRepository(catalogs, { en: localizedLessons.en, pl: new Set<string>() });
    const lesson = await partial.getLesson('python-variables', 'pl' as Language);
    assert.ok(lesson, 'the lesson must still be served');
    assert.equal(partial.isLessonLocalized('python-variables', 'pl'), false);
  });
});
