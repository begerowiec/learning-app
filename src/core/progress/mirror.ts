/**
 * The durable half of persistence.
 *
 * `localStorage` is the wrong place to keep work someone spent weeks on. It is
 * the first thing a browser throws away: Safari deletes all script-writable
 * storage after seven days without a visit, "clear cookies" takes it with the
 * cookies, and every private window starts empty. The learner experiences that
 * as the app forgetting everything they studied.
 *
 * So `localStorage` keeps its job — a synchronous read so Home can paint on the
 * first frame — and IndexedDB becomes the copy that is meant to last. It has a
 * far larger quota, it is what `navigator.storage.persist()` actually protects,
 * and an installed PWA is exempt from Safari's seven-day sweep. Neither store
 * is trusted alone: on boot, whichever one still has the data repairs the other.
 */

/** The async side of the mirror, narrow enough to fake in a test. */
export interface AsyncKeyValueStore {
  get(key: string): Promise<unknown>;
  set(key: string, value: unknown): Promise<void>;
  remove(key: string): Promise<void>;
}

const DB_NAME = 'recall-os';
const DB_VERSION = 1;
const STORE = 'state';

/**
 * IndexedDB, wrapped in promises and opened lazily.
 *
 * Every operation resolves rather than rejects: a mirror that cannot be
 * reached is a degraded guarantee, never a broken app. The caller finds out
 * through `available()` so the UI can tell the learner the truth about how
 * safe their progress is.
 */
export class IndexedDbStore implements AsyncKeyValueStore {
  private db: Promise<IDBDatabase | null> | null = null;
  private reachable: boolean | null = null;

  async get(key: string): Promise<unknown> {
    const db = await this.open();
    if (!db) return null;
    return new Promise((resolve) => {
      try {
        const request = db.transaction(STORE, 'readonly').objectStore(STORE).get(key);
        request.onsuccess = () => resolve(request.result ?? null);
        request.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  }

  async set(key: string, value: unknown): Promise<void> {
    const db = await this.open();
    if (!db) return;
    return new Promise((resolve) => {
      try {
        const transaction = db.transaction(STORE, 'readwrite');
        transaction.objectStore(STORE).put(value, key);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => resolve();
        transaction.onabort = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  async remove(key: string): Promise<void> {
    const db = await this.open();
    if (!db) return;
    return new Promise((resolve) => {
      try {
        const transaction = db.transaction(STORE, 'readwrite');
        transaction.objectStore(STORE).delete(key);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => resolve();
        transaction.onabort = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  /** null until the first operation has actually tried to open the database. */
  available(): boolean | null {
    return this.reachable;
  }

  private open(): Promise<IDBDatabase | null> {
    this.db ??= new Promise<IDBDatabase | null>((resolve) => {
      if (typeof indexedDB === 'undefined') {
        this.reachable = false;
        resolve(null);
        return;
      }
      try {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = () => {
          if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE);
        };
        request.onsuccess = () => {
          this.reachable = true;
          resolve(request.result);
        };
        request.onerror = () => {
          this.reachable = false;
          resolve(null);
        };
        // Firefox in private mode never settles either handler.
        request.onblocked = () => {
          this.reachable = false;
          resolve(null);
        };
      } catch {
        this.reachable = false;
        resolve(null);
      }
    });
    return this.db;
  }
}

/**
 * Asks the browser to treat this origin's storage as worth keeping.
 *
 * Chromium grants it silently for an installed or frequently used app and
 * then exempts the origin from eviction under disk pressure; Safari has no
 * such API, which is why installing the PWA matters there instead. A `false`
 * is normal and not an error — it only means the data is best-effort.
 */
export async function requestPersistentStorage(): Promise<boolean | null> {
  try {
    if (typeof navigator === 'undefined' || !navigator.storage?.persist) return null;
    if (await navigator.storage.persisted()) return true;
    return await navigator.storage.persist();
  } catch {
    return null;
  }
}
