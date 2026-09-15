/**
 * Persistence port for learner state.
 *
 * The app talks to this interface, never to `localStorage` directly, so the
 * same `ProgressService` runs in the browser, in a test, or against a remote
 * backend that syncs later. Reads are synchronous on purpose: the UI has to be
 * able to paint Home on the first frame without an await.
 */
import {
  defaultPreferences,
  detectLanguage,
  emptyProgressState,
  parseUserPreferences,
  ProgressStateSchema,
  type ProgressState,
  type UserPreferences,
} from './models.ts';

export interface ProgressStore {
  loadProgress(): ProgressState;
  saveProgress(state: ProgressState): void;
  loadPreferences(): UserPreferences;
  savePreferences(preferences: UserPreferences): void;
  clear(): void;
}

export const STORAGE_KEYS = {
  progress: 'recall-os:progress:v1',
  preferences: 'recall-os:preferences:v1',
} as const;

/** Anything with the three localStorage methods we use. */
export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/**
 * Browser-backed store.
 *
 * Every read is defensive: private mode, cleared site data and a
 * half-written record from an older version all have to degrade to "start
 * fresh" rather than throw on boot. Writes are equally forgiving — a full
 * quota must not lose the learner's place in the current session.
 */
export class LocalProgressStore implements ProgressStore {
  constructor(private readonly storage: KeyValueStorage | null = safeStorage()) {}

  loadProgress(): ProgressState {
    const raw = this.read(STORAGE_KEYS.progress);
    if (raw === null) return emptyProgressState();
    const parsed = ProgressStateSchema.safeParse(raw);
    if (!parsed.success) {
      console.warn('[loop] stored progress did not validate; starting fresh', parsed.issues);
      return emptyProgressState();
    }
    return parsed.data;
  }

  saveProgress(state: ProgressState): void {
    this.write(STORAGE_KEYS.progress, state);
  }

  loadPreferences(): UserPreferences {
    const raw = this.read(STORAGE_KEYS.preferences);
    // First launch: start in the browser's language rather than forcing English.
    if (raw === null) return defaultPreferences(detectLanguage(navigatorLanguages()));
    return parseUserPreferences(raw);
  }

  savePreferences(preferences: UserPreferences): void {
    this.write(STORAGE_KEYS.preferences, preferences);
  }

  clear(): void {
    try {
      this.storage?.removeItem(STORAGE_KEYS.progress);
      this.storage?.removeItem(STORAGE_KEYS.preferences);
    } catch {
      /* nothing we can do, and nothing worth breaking the UI over */
    }
  }

  private read(key: string): unknown {
    try {
      const value = this.storage?.getItem(key);
      return value ? (JSON.parse(value) as unknown) : null;
    } catch {
      return null;
    }
  }

  private write(key: string, value: unknown): void {
    try {
      this.storage?.setItem(key, JSON.stringify(value));
    } catch {
      /* quota exceeded or storage disabled — in-memory state stays correct */
    }
  }
}

/** Used by tests and by any environment without a DOM. */
export class MemoryProgressStore implements ProgressStore {
  private progress: ProgressState = emptyProgressState();
  private preferences: UserPreferences = defaultPreferences();

  loadProgress(): ProgressState {
    return structuredCloneSafe(this.progress);
  }
  saveProgress(state: ProgressState): void {
    this.progress = structuredCloneSafe(state);
  }
  loadPreferences(): UserPreferences {
    return structuredCloneSafe(this.preferences);
  }
  savePreferences(preferences: UserPreferences): void {
    this.preferences = structuredCloneSafe(preferences);
  }
  clear(): void {
    this.progress = emptyProgressState();
    this.preferences = defaultPreferences();
  }
}

function structuredCloneSafe<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function navigatorLanguages(): string[] {
  if (typeof navigator === 'undefined') return [];
  return [...(navigator.languages ?? []), navigator.language].filter((l): l is string => typeof l === 'string');
}

function safeStorage(): KeyValueStorage | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    const probe = '__recall_os_probe__';
    localStorage.setItem(probe, '1');
    localStorage.removeItem(probe);
    return localStorage;
  } catch {
    return null;
  }
}
