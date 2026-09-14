/**
 * Minimal ambient typings for React 19.
 *
 * The npm registry is unreachable from the build sandbox this project was
 * assembled in, so `@types/react` could not be installed. These declarations
 * cover exactly the API surface the app uses and keep `tsc --noEmit` honest
 * about our own code. Delete this file and `npm i -D @types/react
 * @types/react-dom` for the real thing — nothing else has to change.
 */
declare namespace ReactShim {
  type Key = string | number;
  type CSSProperties = Record<string, string | number | undefined>;
  type ReactNode = unknown;
  type Dispatch<A> = (value: A) => void;
  type SetStateAction<S> = S | ((prev: S) => S);
  interface MutableRefObject<T> {
    current: T;
  }
  interface Context<T> {
    Provider: (props: { value: T; children?: ReactNode }) => unknown;
    Consumer: unknown;
  }
}

declare module 'react' {
  export type Key = ReactShim.Key;
  export type ReactNode = ReactShim.ReactNode;
  export type CSSProperties = ReactShim.CSSProperties;
  export type Dispatch<A> = ReactShim.Dispatch<A>;
  export type SetStateAction<S> = ReactShim.SetStateAction<S>;
  export type MutableRefObject<T> = ReactShim.MutableRefObject<T>;
  export type PropsWithChildren<P = unknown> = P & { children?: ReactNode };
  export type FC<P = unknown> = (props: P) => ReactNode;

  export function useState<S>(initial: S | (() => S)): [S, ReactShim.Dispatch<ReactShim.SetStateAction<S>>];
  export function useEffect(effect: () => void | (() => void), deps?: readonly unknown[]): void;
  export function useLayoutEffect(effect: () => void | (() => void), deps?: readonly unknown[]): void;
  export function useMemo<T>(factory: () => T, deps: readonly unknown[]): T;
  export function useCallback<T extends (...args: never[]) => unknown>(fn: T, deps: readonly unknown[]): T;
  export function useRef<T>(initial: T): ReactShim.MutableRefObject<T>;
  export function useContext<T>(context: ReactShim.Context<T>): T;
  export function createContext<T>(defaultValue: T): ReactShim.Context<T>;
  export function memo<T>(component: T): T;
  export function createElement(type: unknown, props?: unknown, ...children: unknown[]): unknown;
  export const Fragment: (props: { children?: ReactNode }) => ReactNode;
  export const StrictMode: (props: { children?: ReactNode }) => ReactNode;
  const React: {
    createElement: typeof createElement;
    Fragment: typeof Fragment;
    StrictMode: typeof StrictMode;
  };
  export default React;
}

declare module 'react-dom/client' {
  export function createRoot(container: Element | DocumentFragment): {
    render(children: unknown): void;
    unmount(): void;
  };
}

declare module 'react/jsx-runtime' {
  export namespace JSX {
    type Element = unknown;
    interface ElementClass {
      render?: unknown;
    }
    interface ElementAttributesProperty {
      props: unknown;
    }
    interface ElementChildrenAttribute {
      children: unknown;
    }
    interface IntrinsicAttributes {
      key?: ReactShim.Key;
    }
    interface IntrinsicElements {
      [name: string]: Record<string, unknown> & {
        key?: ReactShim.Key;
        style?: ReactShim.CSSProperties;
        className?: string;
        children?: ReactShim.ReactNode;
      };
    }
  }
  export const Fragment: unknown;
  export function jsx(type: unknown, props: unknown, key?: ReactShim.Key): JSX.Element;
  export function jsxs(type: unknown, props: unknown, key?: ReactShim.Key): JSX.Element;
}
