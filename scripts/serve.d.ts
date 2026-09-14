/** Typings for the plain-JS static server used by `npm run serve` and the e2e run. */
declare module '*/serve.mjs' {
  export function createServer(): {
    listen(port: number, host: string, callback: () => void): void;
    close(): void;
  };
}
