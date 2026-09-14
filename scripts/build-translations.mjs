/**
 * Builds src/content/<lang>/lessons/*.json from the English originals plus a
 * translation table.
 *
 *   node scripts/build-translations.mjs
 *
 * Translations are generated rather than hand-copied for one reason: the
 * validator requires a translated lesson to be structurally identical to its
 * original — same exercise ids in the same order, same types, tags, difficulty
 * and answer ids — because the learner's progress and review queue are keyed by
 * them. Copying the structure from the source file makes that true by
 * construction; the table only supplies strings.
 *
 * A field left out of the table keeps its English text. That is deliberate for
 * the English lessons, where the sentence being studied must stay in English
 * while the instruction and explanation around it are translated.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const lessonsDir = path.join(root, 'src/content/lessons');

/** Fields that are prose and may be translated. */
const TEXT_FIELDS = ['question', 'sentence', 'front', 'back', 'explanation', 'topic', 'hint'];

export function buildTranslation(language, table) {
  const outDir = path.join(root, 'src/content', language, 'lessons');
  fs.mkdirSync(outDir, { recursive: true });

  let written = 0;
  const problems = [];

  for (const [lessonId, translation] of Object.entries(table)) {
    const sourcePath = path.join(lessonsDir, `${lessonId}.json`);
    if (!fs.existsSync(sourcePath)) {
      problems.push(`${lessonId}: no English source`);
      continue;
    }
    const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
    const out = structuredClone(source);

    if (translation.title) out.title = translation.title;
    if (translation.description) out.description = translation.description;

    const blocks = translation.content ?? [];
    if (blocks.length > 0 && blocks.length !== source.content.length) {
      problems.push(`${lessonId}: ${blocks.length} translated blocks, ${source.content.length} in the source`);
    }
    out.content.forEach((block, i) => {
      const patch = blocks[i];
      if (!patch) return;
      if (patch.title) block.title = patch.title;
      if (patch.body) block.body = patch.body;
    });

    const exercises = translation.exercises ?? {};
    const unknown = Object.keys(exercises).filter((id) => !source.exercises.some((e) => e.id === id));
    if (unknown.length > 0) problems.push(`${lessonId}: unknown exercise ids ${unknown.join(', ')}`);

    const missing = [];
    out.exercises.forEach((exercise) => {
      const patch = exercises[exercise.id];
      if (!patch) {
        missing.push(exercise.id);
        return;
      }
      for (const field of TEXT_FIELDS) {
        if (patch[field] !== undefined) {
          if (exercise[field] === undefined) problems.push(`${lessonId}/${exercise.id}: no "${field}" to translate`);
          else exercise[field] = patch[field];
        }
      }
      if (patch.answers) {
        for (const answer of exercise.answers ?? []) {
          if (patch.answers[answer.id] !== undefined) answer.text = patch.answers[answer.id];
        }
      }
    });
    if (missing.length > 0) problems.push(`${lessonId}: no translation for ${missing.join(', ')}`);

    fs.writeFileSync(path.join(outDir, `${lessonId}.json`), `${JSON.stringify(out, null, 2)}\n`);
    written += 1;
  }

  return { written, problems };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { pl } = await import('./translations/pl.mjs');
  const { written, problems } = buildTranslation('pl', pl);
  console.log(`pl: ${written} lessons written`);
  if (problems.length > 0) {
    console.error(`\n${problems.length} problem(s):`);
    for (const problem of problems) console.error(`  · ${problem}`);
    process.exit(1);
  }
}
