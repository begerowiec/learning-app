/**
 * Renders the PNG launcher icons from the same design as icon.svg.
 *
 * SVG alone is not enough: Chrome wants a 192 and a 512 PNG before it will
 * offer to install, and iOS reads `apple-touch-icon` and ignores SVG entirely.
 * Installing is what exempts the app from Safari's seven-day storage sweep, so
 * these files are part of the persistence story — run `npm run icons` if the
 * design ever changes.
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const script = path.join(root, 'scripts/make-icons.py');
const result = spawnSync('python3', [script, path.join(root, 'public')], { stdio: 'inherit' });
process.exit(result.status ?? 1);
