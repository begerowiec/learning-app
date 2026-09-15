/**
 * Content validation gate — run in CI and before every build.
 *
 *   npm run validate:content
 *
 * Reads every file under src/content straight from disk (so a lesson that was
 * dropped in but never registered still gets checked), runs it through the
 * same schema the app uses, and reports editorial and translation coverage.
 * Exits non-zero on the first problem, which is what makes "AI output is never
 * rendered unvalidated" an enforced rule rather than an intention.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EXERCISE_TYPES, LANGUAGES, type Language } from '../src/core/domain/schema.ts';
import { formatProblems, validateCatalog, type RawContent } from '../src/core/content/validateCatalog.ts';
import { rawLessons } from '../src/core/content/source.ts';

const root = fileURLToPath(new URL('..', import.meta.url));
const contentDir = path.join(root, 'src/content');

const readJson = (file: string): unknown => JSON.parse(fs.readFileSync(file, 'utf8')) as unknown;

function readLessons(dir: string): Record<string, unknown> {
  if (!fs.existsSync(dir)) return {};
  const out: Record<string, unknown> = {};
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort()) {
    out[path.basename(file, '.json')] = readJson(path.join(dir, file));
  }
  return out;
}

const englishLessons = readLessons(path.join(contentDir, 'lessons'));

const translations: RawContent['translations'] = {};
for (const language of LANGUAGES) {
  if (language === 'en') continue;
  const dir = path.join(contentDir, language);
  if (!fs.existsSync(dir)) continue;
  const catalogPath = path.join(dir, 'catalog.json');
  translations[language] = {
    catalog: fs.existsSync(catalogPath) ? readJson(catalogPath) : undefined,
    lessons: readLessons(path.join(dir, 'lessons')),
  };
}

const { catalogs, localizedLessons, problems } = validateCatalog({
  subjects: readJson(path.join(contentDir, 'subjects.json')),
  modules: readJson(path.join(contentDir, 'modules.json')),
  lessons: englishLessons,
  translations,
});

const catalog = catalogs.en;

/* A lesson on disk that source.ts never imports would silently not ship. */
const unregistered = Object.keys(englishLessons).filter((name) => !(name in rawLessons));
if (unregistered.length > 0) {
  problems.push({
    source: 'src/core/content/source.ts',
    issues: unregistered.map((name) => ({
      path: ['lessons'],
      message: `lessons/${name}.json exists on disk but is not registered — run \`npm run sync:content\``,
    })),
  });
}

/* ─────────────────────────────────────────────────────────────── reporting */

const exerciseCount = catalog.lessons.reduce((n, l) => n + l.exercises.length, 0);
const typeUsage = new Map<string, number>(EXERCISE_TYPES.map((t) => [t, 0]));
const tagUsage = new Map<string, number>();
for (const lesson of catalog.lessons) {
  for (const exercise of lesson.exercises) {
    typeUsage.set(exercise.type, (typeUsage.get(exercise.type) ?? 0) + 1);
    for (const tag of exercise.tags) tagUsage.set(tag, (tagUsage.get(tag) ?? 0) + 1);
  }
}

console.log('Loop content validation\n');
console.log(
  `  subjects  ${catalog.subjects.length}\n` +
    `  modules   ${catalog.modules.length}\n` +
    `  lessons   ${catalog.lessons.length}\n` +
    `  exercises ${exerciseCount}\n` +
    `  tags      ${tagUsage.size}\n`,
);

console.log('  exercise types in use');
for (const [type, count] of typeUsage) {
  const bar = count > 0 ? '█'.repeat(Math.min(28, Math.round(count / 2))) : '';
  console.log(`    ${type.padEnd(22)} ${String(count).padStart(3)} ${bar}`);
}

const unusedTypes = [...typeUsage].filter(([, count]) => count === 0).map(([type]) => type);
if (unusedTypes.length > 0) console.log(`\n  note: no seed content yet for ${unusedTypes.join(', ')}`);

console.log('\n  per subject');
for (const subject of catalog.subjects) {
  const subjectLessons = catalog.lessons.filter((l) => l.subject === subject.id);
  const subjectModules = catalog.modules.filter((m) => m.subject === subject.id);
  const count = subjectLessons.reduce((n, l) => n + l.exercises.length, 0);
  console.log(
    `    ${subject.name.padEnd(12)} ${subjectModules.length} modules · ${subjectLessons.length} lessons · ${count} exercises`,
  );
}

console.log('\n  translation coverage');
for (const language of LANGUAGES) {
  if (language === 'en') continue;
  const done = localizedLessons[language as Language]?.size ?? 0;
  const total = catalog.lessons.length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  console.log(`    ${language}   ${String(done).padStart(2)} / ${total} lessons  ${pct}%`);
  const missing = catalog.lessons.filter((l) => !localizedLessons[language as Language]?.has(l.id)).map((l) => l.id);
  if (missing.length > 0) console.log(`         falls back to English: ${missing.join(', ')}`);
}

if (problems.length > 0) {
  console.error(`\n✗ ${problems.length} problem${problems.length === 1 ? '' : 's'}\n`);
  console.error(formatProblems(problems));
  process.exit(1);
}

console.log('\n✓ content valid\n');
