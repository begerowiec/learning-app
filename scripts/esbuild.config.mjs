import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const root = fileURLToPath(new URL('..', import.meta.url));
export const outdir = path.join(root, 'dist');

/** Shared esbuild options for the browser bundle. */
export const buildOptions = {
  absWorkingDir: root,
  entryPoints: [path.join(root, 'src/main.tsx')],
  outdir,
  bundle: true,
  format: 'esm',
  splitting: false,
  target: ['es2022'],
  jsx: 'automatic',
  jsxImportSource: 'react',
  loader: { '.json': 'json', '.svg': 'dataurl', '.woff2': 'file' },
  alias: {
    '@core': path.join(root, 'src/core'),
    '@ui': path.join(root, 'src/ui'),
    '@content': path.join(root, 'src/content'),
  },
  logLevel: 'info',
  metafile: true,
};
