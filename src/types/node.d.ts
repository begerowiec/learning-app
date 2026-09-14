/**
 * Minimal ambient typings for the Node APIs used by the scripts and tests.
 *
 * Same reason as `react.d.ts`: `@types/node` could not be installed in the
 * sandbox this project was assembled in. Run `npm i -D @types/node`, delete
 * this file, and add "node" to `compilerOptions.types` for the real thing.
 */
declare module 'node:fs' {
  export function readFileSync(path: string, encoding: 'utf8'): string;
  export function readFileSync(path: string): Uint8Array;
  export function readdirSync(path: string): string[];
  export function existsSync(path: string): boolean;
  export function mkdirSync(path: string, options?: { recursive?: boolean }): void;
  export function writeFileSync(path: string, data: string | Uint8Array): void;
  export function rmSync(path: string, options?: { recursive?: boolean; force?: boolean }): void;
  const fs: {
    readFileSync: typeof readFileSync;
    readdirSync: typeof readdirSync;
    existsSync: typeof existsSync;
    mkdirSync: typeof mkdirSync;
    writeFileSync: typeof writeFileSync;
    rmSync: typeof rmSync;
  };
  export default fs;
}

declare module 'node:path' {
  export function join(...parts: string[]): string;
  export function resolve(...parts: string[]): string;
  export function basename(path: string, ext?: string): string;
  export function dirname(path: string): string;
  export function extname(path: string): string;
  const path: {
    join: typeof join;
    resolve: typeof resolve;
    basename: typeof basename;
    dirname: typeof dirname;
    extname: typeof extname;
  };
  export default path;
}

declare module 'node:url' {
  export function fileURLToPath(url: string | URL): string;
}

declare module 'node:test' {
  type TestFn = () => void | Promise<void>;
  export function test(name: string, fn: TestFn): void;
  export function describe(name: string, fn: () => void): void;
  export function it(name: string, fn: TestFn): void;
  export function before(fn: TestFn): void;
  export function beforeEach(fn: TestFn): void;
  export function after(fn: TestFn): void;
  export function afterEach(fn: TestFn): void;
  const runner: { test: typeof test; describe: typeof describe; it: typeof it };
  export default runner;
}

declare module 'node:assert/strict' {
  interface Assert {
    (value: unknown, message?: string): void;
    equal(actual: unknown, expected: unknown, message?: string): void;
    notEqual(actual: unknown, expected: unknown, message?: string): void;
    deepEqual(actual: unknown, expected: unknown, message?: string): void;
    notDeepEqual(actual: unknown, expected: unknown, message?: string): void;
    ok(value: unknown, message?: string): void;
    throws(fn: () => unknown, message?: string): void;
    match(value: string, pattern: RegExp, message?: string): void;
  }
  const assert: Assert;
  export default assert;
}

declare module 'node:child_process' {
  export function spawn(
    command: string,
    args: string[],
    options?: { cwd?: string; stdio?: string; env?: Record<string, string | undefined> },
  ): {
    kill(signal?: string): void;
    on(event: string, listener: (code: number | null) => void): void;
    stdout: { on(event: string, listener: (chunk: unknown) => void): void } | null;
    stderr: { on(event: string, listener: (chunk: unknown) => void): void } | null;
  };
}

declare const process: {
  argv: string[];
  env: Record<string, string | undefined>;
  exit(code?: number): never;
  exitCode: number | undefined;
  cwd(): string;
  platform: string;
  on(event: string, listener: (...args: unknown[]) => void): void;
};

interface ImportMeta {
  url: string;
}
