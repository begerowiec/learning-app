/** Static file server for dist/ — used by `npm run serve` and the e2e run. */
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { outdir } from './esbuild.config.mjs';

const PORT = Number(process.env.PORT ?? 4173);
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.map': 'application/json; charset=utf-8',
};

export function createServer() {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    const rel = decodeURIComponent(url.pathname).replace(/^\/+/, '');
    const candidate = path.join(outdir, rel || 'index.html');
    const file = path.resolve(candidate).startsWith(path.resolve(outdir)) ? candidate : path.join(outdir, 'index.html');
    try {
      const body = await fs.readFile(file);
      res.writeHead(200, { 'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream' });
      res.end(body);
    } catch {
      const body = await fs.readFile(path.join(outdir, 'index.html'));
      res.writeHead(200, { 'content-type': TYPES['.html'] });
      res.end(body);
    }
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  createServer().listen(PORT, '127.0.0.1', () => console.log(`serving dist/ → http://127.0.0.1:${PORT}`));
}
