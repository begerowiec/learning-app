/** Production build: bundle + minify into dist/, then copy the static shell. */
import * as esbuild from 'esbuild';
import fs from 'node:fs/promises';
import path from 'node:path';
import { buildOptions, outdir, root } from './esbuild.config.mjs';

await fs.rm(outdir, { recursive: true, force: true });
await fs.mkdir(outdir, { recursive: true });

const result = await esbuild.build({
  ...buildOptions,
  minify: true,
  sourcemap: 'linked',
  define: { 'process.env.NODE_ENV': '"production"' },
});

await copyStatic();

const bytes = Object.entries(result.metafile.outputs)
  .map(([file, out]) => `  ${path.relative(root, file).padEnd(28)} ${(out.bytes / 1024).toFixed(1)} kB`)
  .join('\n');
console.log(`\nbuilt dist/\n${bytes}\n`);

async function copyStatic() {
  await fs.cp(path.join(root, 'public'), outdir, { recursive: true });
  const html = await fs.readFile(path.join(root, 'index.html'), 'utf8');
  await fs.writeFile(path.join(outdir, 'index.html'), html.replace('/src/main.tsx', '/main.js'));
}
