/** Dev server: incremental rebuilds plus a static server on :5173. */
import * as esbuild from 'esbuild';
import fs from 'node:fs/promises';
import path from 'node:path';
import { buildOptions, outdir, root } from './esbuild.config.mjs';

await fs.mkdir(outdir, { recursive: true });
await fs.cp(path.join(root, 'public'), outdir, { recursive: true });
const html = await fs.readFile(path.join(root, 'index.html'), 'utf8');
await fs.writeFile(path.join(outdir, 'index.html'), html.replace('./src/main.tsx', './main.js'));

const ctx = await esbuild.context({ ...buildOptions, sourcemap: 'inline' });
await ctx.watch();
const { hosts, port } = await ctx.serve({ servedir: outdir, host: '127.0.0.1', port: 5173, fallback: path.join(outdir, 'index.html') });
console.log(`\nRECALL/OS dev server → http://${hosts[0]}:${port}\n`);
