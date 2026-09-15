/** Production build: bundle + minify into dist/, then copy the static shell. */
import * as esbuild from 'esbuild';
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { buildOptions, outdir, root } from './esbuild.config.mjs';

await fs.rm(outdir, { recursive: true, force: true });
await fs.mkdir(outdir, { recursive: true });

const result = await esbuild.build({
  ...buildOptions,
  minify: true,
  sourcemap: 'linked',
  define: { 'process.env.NODE_ENV': '"production"', __PROD__: 'true' },
});

await copyStatic();

const bytes = Object.entries(result.metafile.outputs)
  .map(([file, out]) => `  ${path.relative(root, file).padEnd(28)} ${(out.bytes / 1024).toFixed(1)} kB`)
  .join('\n');
console.log(`\nbuilt dist/\n${bytes}\n`);

async function copyStatic() {
  await fs.cp(path.join(root, 'public'), outdir, { recursive: true });

  const html = await fs.readFile(path.join(root, 'index.html'), 'utf8');
  await fs.writeFile(path.join(outdir, 'index.html'), html.replace('./src/main.tsx', './main.js'));

  await stampServiceWorker();
}

/**
 * Names the service worker's cache after the bundle it was built from.
 *
 * The app ships fixed filenames (`main.js`, `main.css`) and the worker serves
 * them cache-first, so without this a returning learner would keep getting the
 * build they first visited. A content hash in the cache name means `activate`
 * drops the old cache and picks up the new assets.
 */
async function stampServiceWorker() {
  const swPath = path.join(outdir, 'sw.js');
  const [bundle, css, sw] = await Promise.all([
    fs.readFile(path.join(outdir, 'main.js')),
    fs.readFile(path.join(outdir, 'main.css')),
    fs.readFile(swPath, 'utf8'),
  ]);
  const buildId = createHash('sha256').update(bundle).update(css).digest('hex').slice(0, 12);
  await fs.writeFile(swPath, sw.replaceAll('__BUILD_ID__', buildId));
  return buildId;
}
