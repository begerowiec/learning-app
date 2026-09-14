/** Side-effect stylesheet imports — handled by the bundler, opaque to TypeScript. */
declare module '*.css';
declare module '*.svg' {
  const url: string;
  export default url;
}
