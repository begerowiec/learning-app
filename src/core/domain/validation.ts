/**
 * A tiny schema-validation kit — the project's stand-in for Zod.
 *
 * It exists because this repo is intentionally dependency-light (the build
 * sandbox had no registry access), and because content validation is the one
 * place the app must not be sloppy: AI-generated JSON is never rendered
 * without passing through a schema first. The API deliberately mirrors Zod's
 * so that swapping in the real library later is a mechanical change:
 *
 *   v.object({ id: v.string().min(1) })   ≈   z.object({ id: z.string().min(1) })
 *   schema.safeParse(value)               ≈   schema.safeParse(value)
 *
 * Supported: string / number / boolean / literal / enum / array / object
 * (strict by default) / record / tagged union / optional / default / refine /
 * check (Zod's superRefine).
 */

export type PathSegment = string | number;
export interface Issue {
  path: PathSegment[];
  message: string;
}
export type ParseResult<T> = { success: true; data: T } | { success: false; issues: Issue[] };

const INVALID: unique symbol = Symbol('invalid');
type Invalid = typeof INVALID;

export interface Ctx {
  path: PathSegment[];
  issues: Issue[];
  /** Records a problem at the current path (or a child of it). */
  issue(message: string, at?: PathSegment[]): void;
}

function makeCtx(path: PathSegment[], issues: Issue[]): Ctx {
  return {
    path,
    issues,
    issue(message, at = []) {
      issues.push({ path: [...path, ...at], message });
    },
  };
}

export function formatIssues(issues: Issue[]): string {
  return issues
    .map((i) => `  · ${i.path.length ? i.path.join('.') : '(root)'}: ${i.message}`)
    .join('\n');
}

export class ValidationError extends Error {
  constructor(
    message: string,
    readonly issues: Issue[],
  ) {
    super(`${message}\n${formatIssues(issues)}`);
    this.name = 'ValidationError';
  }
}

type Refinement<T> = (value: T, ctx: Ctx) => void;

/* ───────────────────────────────────────────────────────────── base schema */

export abstract class Schema<T> {
  /** Phantom field carrying the output type for `Infer`. */
  declare readonly __output: T;
  protected refinements: Refinement<T>[] = [];

  protected abstract parseValue(value: unknown, ctx: Ctx): T | Invalid;

  /** @internal */
  run(value: unknown, ctx: Ctx): T | Invalid {
    const parsed = this.parseValue(value, ctx);
    if (parsed === INVALID) return INVALID;
    const before = ctx.issues.length;
    for (const refine of this.refinements) refine(parsed, ctx);
    return ctx.issues.length === before ? parsed : INVALID;
  }

  safeParse(value: unknown): ParseResult<T> {
    const issues: Issue[] = [];
    const data = this.run(value, makeCtx([], issues));
    return data === INVALID || issues.length > 0 ? { success: false, issues } : { success: true, data };
  }

  parse(value: unknown, label = 'value failed validation'): T {
    const result = this.safeParse(value);
    if (!result.success) throw new ValidationError(label, result.issues);
    return result.data;
  }

  /** Zod's `.refine` — a boolean predicate with one message. */
  refine(predicate: (value: T) => boolean, message: string): this {
    const next = this.clone();
    next.refinements = [
      ...this.refinements,
      (value, ctx) => {
        if (!predicate(value)) ctx.issue(message);
      },
    ];
    return next;
  }

  /** Zod's `.superRefine` — full control over paths and messages. */
  check(refine: Refinement<T>): this {
    const next = this.clone();
    next.refinements = [...this.refinements, refine];
    return next;
  }

  optional(): OptionalSchema<T> {
    return new OptionalSchema(this);
  }

  default(fallback: T | (() => T)): DefaultSchema<T> {
    return new DefaultSchema(this, fallback);
  }

  protected clone(): this {
    const copy = Object.create(Object.getPrototypeOf(this) as object) as this;
    Object.assign(copy, this);
    return copy;
  }
}

export type Infer<S> = S extends Schema<infer T> ? T : never;

/**
 * `Schema<any>` rather than `Schema<unknown>`: refinement callbacks make the
 * type parameter contravariant, so `Schema<string>` is not assignable to
 * `Schema<unknown>`. `any` is the standard escape hatch for a heterogeneous
 * schema container and is confined to this one alias.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySchema = Schema<any>;
export type { AnySchema };

export class OptionalSchema<T> extends Schema<T | undefined> {
  readonly isOptional = true as const;
  constructor(private readonly inner: Schema<T>) {
    super();
  }
  protected override parseValue(value: unknown, ctx: Ctx): T | undefined | Invalid {
    if (value === undefined || value === null) return undefined;
    return this.inner.run(value, ctx);
  }
}

export class DefaultSchema<T> extends Schema<T> {
  constructor(
    private readonly inner: Schema<T>,
    private readonly fallback: T | (() => T),
  ) {
    super();
  }
  protected override parseValue(value: unknown, ctx: Ctx): T | Invalid {
    if (value === undefined || value === null) {
      return typeof this.fallback === 'function' ? (this.fallback as () => T)() : this.fallback;
    }
    return this.inner.run(value, ctx);
  }
}

/* ──────────────────────────────────────────────────────────────── scalars */

class StringSchema extends Schema<string> {
  private rules: Refinement<string>[] = [];
  protected override parseValue(value: unknown, ctx: Ctx): string | Invalid {
    if (typeof value !== 'string') {
      ctx.issue(`expected string, received ${describe(value)}`);
      return INVALID;
    }
    const before = ctx.issues.length;
    for (const rule of this.rules) rule(value, ctx);
    return ctx.issues.length === before ? value : INVALID;
  }
  private withRule(rule: Refinement<string>): StringSchema {
    const next = this.clone();
    next.rules = [...this.rules, rule];
    return next;
  }
  min(n: number): StringSchema {
    return this.withRule((v, ctx) => {
      if (v.length < n) ctx.issue(`must be at least ${n} character${n === 1 ? '' : 's'} long`);
    });
  }
  max(n: number): StringSchema {
    return this.withRule((v, ctx) => {
      if (v.length > n) ctx.issue(`must be at most ${n} characters long (got ${v.length})`);
    });
  }
  regex(pattern: RegExp, message?: string): StringSchema {
    return this.withRule((v, ctx) => {
      if (!pattern.test(v)) ctx.issue(message ?? `must match ${pattern}`);
    });
  }
  includes(needle: string, message?: string): StringSchema {
    return this.withRule((v, ctx) => {
      if (!v.includes(needle)) ctx.issue(message ?? `must contain "${needle}"`);
    });
  }
}

class NumberSchema extends Schema<number> {
  private rules: Refinement<number>[] = [];
  protected override parseValue(value: unknown, ctx: Ctx): number | Invalid {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      ctx.issue(`expected number, received ${describe(value)}`);
      return INVALID;
    }
    const before = ctx.issues.length;
    for (const rule of this.rules) rule(value, ctx);
    return ctx.issues.length === before ? value : INVALID;
  }
  private withRule(rule: Refinement<number>): NumberSchema {
    const next = this.clone();
    next.rules = [...this.rules, rule];
    return next;
  }
  int(): NumberSchema {
    return this.withRule((v, ctx) => {
      if (!Number.isInteger(v)) ctx.issue('must be an integer');
    });
  }
  min(n: number): NumberSchema {
    return this.withRule((v, ctx) => {
      if (v < n) ctx.issue(`must be >= ${n}`);
    });
  }
  max(n: number): NumberSchema {
    return this.withRule((v, ctx) => {
      if (v > n) ctx.issue(`must be <= ${n}`);
    });
  }
}

class BooleanSchema extends Schema<boolean> {
  protected override parseValue(value: unknown, ctx: Ctx): boolean | Invalid {
    if (typeof value !== 'boolean') {
      ctx.issue(`expected boolean, received ${describe(value)}`);
      return INVALID;
    }
    return value;
  }
}

class LiteralSchema<L extends string | number | boolean> extends Schema<L> {
  constructor(private readonly literal: L) {
    super();
  }
  protected override parseValue(value: unknown, ctx: Ctx): L | Invalid {
    if (value !== this.literal) {
      ctx.issue(`expected ${JSON.stringify(this.literal)}, received ${describe(value)}`);
      return INVALID;
    }
    return this.literal;
  }
}

class EnumSchema<T extends string> extends Schema<T> {
  constructor(readonly options: readonly T[]) {
    super();
  }
  protected override parseValue(value: unknown, ctx: Ctx): T | Invalid {
    if (typeof value !== 'string' || !this.options.includes(value as T)) {
      ctx.issue(`expected one of [${this.options.join(' | ')}], received ${describe(value)}`);
      return INVALID;
    }
    return value as T;
  }
}

/* ─────────────────────────────────────────────────────── arrays / objects */

class ArraySchema<T> extends Schema<T[]> {
  private minLen?: number;
  private maxLen?: number;
  constructor(private readonly item: Schema<T>) {
    super();
  }
  protected override parseValue(value: unknown, ctx: Ctx): T[] | Invalid {
    if (!Array.isArray(value)) {
      ctx.issue(`expected array, received ${describe(value)}`);
      return INVALID;
    }
    if (this.minLen !== undefined && value.length < this.minLen) {
      ctx.issue(`must contain at least ${this.minLen} item${this.minLen === 1 ? '' : 's'} (got ${value.length})`);
      return INVALID;
    }
    if (this.maxLen !== undefined && value.length > this.maxLen) {
      ctx.issue(`must contain at most ${this.maxLen} items (got ${value.length})`);
      return INVALID;
    }
    const out: T[] = [];
    let ok = true;
    value.forEach((entry, index) => {
      const parsed = this.item.run(entry, makeCtx([...ctx.path, index], ctx.issues));
      if (parsed === INVALID) ok = false;
      else out.push(parsed);
    });
    return ok ? out : INVALID;
  }
  min(n: number): ArraySchema<T> {
    const next = this.clone();
    next.minLen = n;
    return next;
  }
  max(n: number): ArraySchema<T> {
    const next = this.clone();
    next.maxLen = n;
    return next;
  }
}

type Shape = Record<string, AnySchema>;
type OptionalKeysOf<S extends Shape> = {
  [K in keyof S]: S[K] extends { readonly isOptional: true } ? K : never;
}[keyof S];
type Prettify<T> = { [K in keyof T]: T[K] } & {};
export type ObjectOutput<S extends Shape> = Prettify<
  { [K in Exclude<keyof S, OptionalKeysOf<S>>]: Infer<S[K]> } & {
    [K in OptionalKeysOf<S>]?: Exclude<Infer<S[K]>, undefined>;
  }
>;

class ObjectSchema<S extends Shape> extends Schema<ObjectOutput<S>> {
  private allowUnknown = false;
  constructor(readonly shape: S) {
    super();
  }
  protected override parseValue(value: unknown, ctx: Ctx): ObjectOutput<S> | Invalid {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      ctx.issue(`expected object, received ${describe(value)}`);
      return INVALID;
    }
    const input = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    let ok = true;
    for (const key of Object.keys(this.shape)) {
      const schema = this.shape[key] as AnySchema;
      const parsed = schema.run(input[key], makeCtx([...ctx.path, key], ctx.issues));
      if (parsed === INVALID) ok = false;
      else if (parsed !== undefined) out[key] = parsed;
    }
    if (!this.allowUnknown) {
      const unknownKeys = Object.keys(input).filter((k) => !(k in this.shape));
      if (unknownKeys.length > 0) {
        ctx.issue(`unrecognized key${unknownKeys.length === 1 ? '' : 's'}: ${unknownKeys.join(', ')}`);
        ok = false;
      }
    }
    return ok ? (out as ObjectOutput<S>) : INVALID;
  }
  passthrough(): ObjectSchema<S> {
    const next = this.clone();
    next.allowUnknown = true;
    return next;
  }
}

class RecordSchema<K extends string, V> extends Schema<Partial<Record<K, V>>> {
  constructor(
    private readonly keys: readonly K[],
    private readonly value: Schema<V>,
  ) {
    super();
  }
  protected override parseValue(value: unknown, ctx: Ctx): Partial<Record<K, V>> | Invalid {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      ctx.issue(`expected object, received ${describe(value)}`);
      return INVALID;
    }
    const input = value as Record<string, unknown>;
    const out: Partial<Record<K, V>> = {};
    let ok = true;
    for (const key of Object.keys(input)) {
      if (!this.keys.includes(key as K)) {
        ctx.issue(`unrecognized key: ${key} (expected one of [${this.keys.join(' | ')}])`);
        ok = false;
        continue;
      }
      const parsed = this.value.run(input[key], makeCtx([...ctx.path, key], ctx.issues));
      if (parsed === INVALID) ok = false;
      else out[key as K] = parsed;
    }
    return ok ? out : INVALID;
  }
}

/**
 * A union discriminated by a string field — the mechanism behind
 * `ContentBlock` and `Exercise`. Dispatching on the tag means a malformed
 * exercise produces one precise error ("find_error → code: …") instead of a
 * pile of mismatches against every other member.
 */
class TaggedUnionSchema<TTag extends string, M extends Record<string, AnySchema>> extends Schema<Infer<M[keyof M]>> {
  constructor(
    private readonly tag: TTag,
    private readonly members: M,
  ) {
    super();
  }
  protected override parseValue(value: unknown, ctx: Ctx): Infer<M[keyof M]> | Invalid {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      ctx.issue(`expected object, received ${describe(value)}`);
      return INVALID;
    }
    const tagValue = (value as Record<string, unknown>)[this.tag];
    const keys = Object.keys(this.members);
    if (typeof tagValue !== 'string' || !keys.includes(tagValue)) {
      ctx.issue(`${this.tag} must be one of [${keys.join(' | ')}], received ${describe(tagValue)}`, [this.tag]);
      return INVALID;
    }
    const member = this.members[tagValue] as AnySchema;
    return member.run(value, ctx) as Infer<M[keyof M]> | Invalid;
  }
}

/**
 * An object with an open key set — `{ [id]: value }`. `record` validates
 * against a fixed key union; this one accepts any key matching an optional
 * pattern, which is what translation overlays keyed by content id need.
 */
class MapSchema<V> extends Schema<Record<string, V>> {
  constructor(
    private readonly value: Schema<V>,
    private readonly keyPattern?: RegExp,
  ) {
    super();
  }
  protected override parseValue(value: unknown, ctx: Ctx): Record<string, V> | Invalid {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      ctx.issue(`expected object, received ${describe(value)}`);
      return INVALID;
    }
    const input = value as Record<string, unknown>;
    const out: Record<string, V> = {};
    let ok = true;
    for (const key of Object.keys(input)) {
      if (this.keyPattern && !this.keyPattern.test(key)) {
        ctx.issue(`key "${key}" does not match ${this.keyPattern}`);
        ok = false;
        continue;
      }
      const parsed = this.value.run(input[key], makeCtx([...ctx.path, key], ctx.issues));
      if (parsed === INVALID) ok = false;
      else out[key] = parsed;
    }
    return ok ? out : INVALID;
  }
}

function describe(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'string') return `string ${JSON.stringify(value.length > 24 ? `${value.slice(0, 24)}…` : value)}`;
  return typeof value;
}

/* ─────────────────────────────────────────────────────────── public façade */

export const v = {
  string: () => new StringSchema(),
  number: () => new NumberSchema(),
  boolean: () => new BooleanSchema(),
  literal: <L extends string | number | boolean>(value: L) => new LiteralSchema(value),
  enum: <T extends string>(options: readonly T[]) => new EnumSchema(options),
  array: <T>(item: Schema<T>) => new ArraySchema(item),
  object: <S extends Shape>(shape: S) => new ObjectSchema(shape),
  record: <K extends string, V>(keys: readonly K[], value: Schema<V>) => new RecordSchema(keys, value),
  map: <V>(value: Schema<V>, keyPattern?: RegExp) => new MapSchema(value, keyPattern),
  taggedUnion: <TTag extends string, M extends Record<string, AnySchema>>(tag: TTag, members: M) =>
    new TaggedUnionSchema(tag, members),
};
