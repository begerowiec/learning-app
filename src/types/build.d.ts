/**
 * Build-time flags, replaced by esbuild's `define` in both dev and production.
 *
 * Declared rather than read off `process.env` because the browser bundle has
 * no `process`, and a stray `process.env.NODE_ENV` in app code is a runtime
 * crash waiting for the one path that isn't minified.
 */
declare const __PROD__: boolean;
