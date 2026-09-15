/**
 * A `ProgressStore` that keeps two copies and trusts neither on its own.
 *
 * Reads and writes go to the fast synchronous store first, because Home has to
 * paint without awaiting anything. Every write is then mirrored into IndexedDB.
 * On boot, `hydrate()` compares the two: if the fast store came back empty but
 * the mirror still has a history, the fast store is refilled from it — which is
 * exactly the case where a browser swept `localStorage` and the learner would
 * otherwise open the app to a blank profile.
 *
 * Repair is deliberately one-directional and only fires on an *empty* fast
 * store. A mirror is not allowed to out-vote data that is actually there, so
 * "reset my progress" can never be undone by a stale copy — `clear()` wipes
 * both.
 */
import type { ProgressState, UserPreferences } from './models.ts';
import { ProgressStateSchema, parseUserPreferences } from './models.ts';
import type { ProgressStore } from './ProgressStore.ts';
import { STORAGE_KEYS } from './ProgressStore.ts';
import type { AsyncKeyValueStore } from './mirror.ts';
import { requestPersistentStorage } from './mirror.ts';

/** What the Profile screen shows the learner about how safe their data is. */
export interface StorageDiagnostics {
  /** IndexedDB reachable: the copy that is meant to survive. */
  mirrorAvailable: boolean;
  /** Browser promised not to evict this origin. `null` where unsupported. */
  persistent: boolean | null;
  /** The fast store was empty on boot and was refilled from the mirror. */
  restored: boolean;
  /** ISO timestamp of the last successful mirror write. */
  lastMirroredAt: string | null;
}

interface MirrorRecord<T> {
  savedAt: string;
  value: T;
}

export class DurableProgressStore implements ProgressStore {
  private lastMirroredAt: string | null = null;
  private restored = false;
  private mirrorAvailable = false;

  constructor(
    private readonly fast: ProgressStore,
    private readonly mirror: AsyncKeyValueStore | null,
    private readonly clock: () => Date = () => new Date(),
  ) {}

  /* ─────────────────────────────────────────── ProgressStore, synchronous */

  loadProgress(): ProgressState {
    return this.fast.loadProgress();
  }

  saveProgress(state: ProgressState): void {
    this.fast.saveProgress(state);
    this.push(STORAGE_KEYS.progress, state);
  }

  loadPreferences(): UserPreferences {
    return this.fast.loadPreferences();
  }

  savePreferences(preferences: UserPreferences): void {
    this.fast.savePreferences(preferences);
    this.push(STORAGE_KEYS.preferences, preferences);
  }

  clear(): void {
    this.fast.clear();
    void this.mirror?.remove(STORAGE_KEYS.progress);
    void this.mirror?.remove(STORAGE_KEYS.preferences);
    this.lastMirroredAt = null;
  }

  /* ───────────────────────────────────────────────────────────── boot */

  /**
   * Reconciles the two copies. Resolves to `true` when the fast store was
   * refilled, which is the caller's cue to re-read state and re-render.
   */
  async hydrate(): Promise<boolean> {
    const persistent = await requestPersistentStorage();
    this.persistent = persistent;
    if (!this.mirror) return false;

    const [mirroredProgress, mirroredPreferences] = await Promise.all([
      this.mirror.get(STORAGE_KEYS.progress),
      this.mirror.get(STORAGE_KEYS.preferences),
    ]);
    this.mirrorAvailable = true;

    let restored = false;

    const progressRecord = asRecord(mirroredProgress);
    if (isPristineProgress(this.fast.loadProgress()) && progressRecord) {
      const parsed = ProgressStateSchema.safeParse(progressRecord.value);
      if (parsed.success && !isPristineProgress(parsed.data)) {
        this.fast.saveProgress(parsed.data);
        restored = true;
      }
    }

    const preferencesRecord = asRecord(mirroredPreferences);
    if (isPristinePreferences(this.fast.loadPreferences()) && preferencesRecord) {
      const preferences = parseUserPreferences(preferencesRecord.value);
      if (!isPristinePreferences(preferences)) {
        this.fast.savePreferences(preferences);
        restored = true;
      }
    }

    // Whatever survived is now the truth — make sure the mirror agrees.
    if (!restored) {
      this.push(STORAGE_KEYS.progress, this.fast.loadProgress());
      this.push(STORAGE_KEYS.preferences, this.fast.loadPreferences());
    }

    this.restored = restored;
    return restored;
  }

  private persistent: boolean | null = null;

  diagnostics(): StorageDiagnostics {
    return {
      mirrorAvailable: this.mirrorAvailable,
      persistent: this.persistent,
      restored: this.restored,
      lastMirroredAt: this.lastMirroredAt,
    };
  }

  /** Fire-and-forget: a slow or failed mirror write must not stall an answer. */
  private push(key: string, value: unknown): void {
    if (!this.mirror) return;
    const savedAt = this.clock().toISOString();
    void this.mirror
      .set(key, { savedAt, value } satisfies MirrorRecord<unknown>)
      .then(() => {
        this.lastMirroredAt = savedAt;
        this.mirrorAvailable = true;
      })
      .catch(() => {
        this.mirrorAvailable = false;
      });
  }
}

function asRecord(value: unknown): MirrorRecord<unknown> | null {
  if (typeof value !== 'object' || value === null) return null;
  const raw = value as Record<string, unknown>;
  if (typeof raw.savedAt !== 'string' || !('value' in raw)) return null;
  return { savedAt: raw.savedAt, value: raw.value };
}

/** "Nothing has happened here yet" — the only state safe to overwrite. */
export function isPristineProgress(state: ProgressState): boolean {
  return (
    state.attempts.length === 0 &&
    state.lessons.length === 0 &&
    state.sessions.length === 0 &&
    state.studyDays.length === 0 &&
    state.activeSession === undefined
  );
}

export function isPristinePreferences(preferences: UserPreferences): boolean {
  return !preferences.onboarded && preferences.subjects.length === 0;
}
