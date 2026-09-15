/**
 * Persistence is the one part of this app with no server to fall back on, so
 * these tests cover the two things that actually lose a learner's history:
 * a browser clearing `localStorage`, and moving to a different device.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  DurableProgressStore,
  isPristinePreferences,
  isPristineProgress,
} from '../../src/core/progress/DurableProgressStore.ts';
import { LocalProgressStore, STORAGE_KEYS, type KeyValueStorage } from '../../src/core/progress/ProgressStore.ts';
import type { AsyncKeyValueStore } from '../../src/core/progress/mirror.ts';
import {
  backupFilename,
  createBackup,
  parseBackup,
  serializeBackup,
  summarize,
} from '../../src/core/progress/backup.ts';
import {
  defaultPreferences,
  emptyProgressState,
  type ExerciseAttempt,
  type LessonProgress,
  type ProgressState,
  type UserPreferences,
} from '../../src/core/progress/models.ts';

/* ───────────────────────────────────────────────────────────────── fixtures */

function fakeLocalStorage(): KeyValueStorage & { wipe: () => void; data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
    removeItem: (key) => void data.delete(key),
    /** What Safari's seven-day sweep or "clear site data" does. */
    wipe: () => data.clear(),
  };
}

function fakeMirror(): AsyncKeyValueStore & { data: Map<string, unknown> } {
  const data = new Map<string, unknown>();
  return {
    data,
    get: (key) => Promise.resolve(data.get(key) ?? null),
    set: (key, value) => {
      data.set(key, value);
      return Promise.resolve();
    },
    remove: (key) => {
      data.delete(key);
      return Promise.resolve();
    },
  };
}

function attempt(id: string): ExerciseAttempt {
  return {
    exerciseId: id,
    lessonId: 'python-variables',
    subjectId: 'python',
    tags: ['variables'],
    correct: true,
    answeredAt: '2026-09-15T08:00:00.000Z',
    durationSeconds: 4,
    attempts: 1,
  };
}

function lesson(): LessonProgress {
  return {
    lessonId: 'python-variables',
    subjectId: 'python',
    moduleId: 'python-basics',
    status: 'completed',
    correctCount: 8,
    incorrectCount: 1,
    totalExercises: 9,
    nextExerciseIndex: 0,
  };
}

function studiedState(): ProgressState {
  return {
    ...emptyProgressState(),
    attempts: [attempt('python-variables-001'), attempt('python-variables-002')],
    lessons: [lesson()],
    studyDays: ['2026-09-15'],
  };
}

function onboardedPreferences(): UserPreferences {
  return { ...defaultPreferences(), onboarded: true, subjects: ['python'], dailyGoalMinutes: 15 };
}

/** A store whose mirror writes have all settled. */
async function settled(store: DurableProgressStore): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
  void store;
}

/* ──────────────────────────────────────────────────────────── pristine test */

describe('emptiness', () => {
  test('a fresh state is pristine and a studied one is not', () => {
    assert.equal(isPristineProgress(emptyProgressState()), true);
    assert.equal(isPristineProgress(studiedState()), false);
  });

  test('an interrupted session alone is enough to count as used', () => {
    const state: ProgressState = {
      ...emptyProgressState(),
      activeSession: {
        id: 's1',
        kind: 'lesson',
        label: 'Python · Variables',
        exerciseIds: ['python-variables-001'],
        index: 0,
        startedAt: '2026-09-15T08:00:00.000Z',
        results: [],
      },
    };
    assert.equal(isPristineProgress(state), false);
  });

  test('preferences count as used once onboarding is done', () => {
    assert.equal(isPristinePreferences(defaultPreferences()), true);
    assert.equal(isPristinePreferences(onboardedPreferences()), false);
  });
});

/* ───────────────────────────────────────────────────── the durable store */

describe('durable store', () => {
  test('every write reaches the mirror as well as the fast store', async () => {
    const local = fakeLocalStorage();
    const mirror = fakeMirror();
    const store = new DurableProgressStore(new LocalProgressStore(local), mirror);

    store.saveProgress(studiedState());
    store.savePreferences(onboardedPreferences());
    await settled(store);

    assert.ok(local.data.has(STORAGE_KEYS.progress), 'fast store holds progress');
    assert.ok(mirror.data.has(STORAGE_KEYS.progress), 'mirror holds progress');
    assert.ok(mirror.data.has(STORAGE_KEYS.preferences), 'mirror holds preferences');
  });

  test('an evicted localStorage is refilled from the mirror', async () => {
    const local = fakeLocalStorage();
    const mirror = fakeMirror();
    const store = new DurableProgressStore(new LocalProgressStore(local), mirror);

    store.saveProgress(studiedState());
    store.savePreferences(onboardedPreferences());
    await settled(store);

    // The browser throws site data away between visits.
    local.wipe();
    assert.equal(isPristineProgress(store.loadProgress()), true, 'precondition: the fast store is empty');

    const fresh = new DurableProgressStore(new LocalProgressStore(local), mirror);
    assert.equal(await fresh.hydrate(), true, 'hydrate must report a restore');

    const restored = fresh.loadProgress();
    assert.equal(restored.attempts.length, 2);
    assert.equal(restored.lessons[0]?.status, 'completed');
    assert.equal(fresh.loadPreferences().onboarded, true);
    assert.equal(fresh.diagnostics().restored, true);
  });

  test('the mirror never overwrites progress that is actually there', async () => {
    const local = fakeLocalStorage();
    const mirror = fakeMirror();

    // A stale, richer copy in the mirror…
    await mirror.set(STORAGE_KEYS.progress, {
      savedAt: '2026-09-01T00:00:00.000Z',
      value: { ...studiedState(), attempts: [attempt('a'), attempt('b'), attempt('c')] },
    });

    // …must not win over what this device has now.
    const fast = new LocalProgressStore(local);
    fast.saveProgress({ ...emptyProgressState(), attempts: [attempt('local-only')], studyDays: ['2026-09-15'] });

    const store = new DurableProgressStore(fast, mirror);
    assert.equal(await store.hydrate(), false);
    assert.equal(store.loadProgress().attempts.length, 1);
    assert.equal(store.loadProgress().attempts[0]?.exerciseId, 'local-only');
  });

  test('hydrate pushes the surviving copy back into the mirror', async () => {
    const local = fakeLocalStorage();
    const mirror = fakeMirror();
    const fast = new LocalProgressStore(local);
    fast.saveProgress(studiedState());

    const store = new DurableProgressStore(fast, mirror);
    await store.hydrate();
    await settled(store);

    assert.ok(mirror.data.has(STORAGE_KEYS.progress), 'a mirror that was behind is caught up');
  });

  test('a reset clears both copies, so nothing resurrects it', async () => {
    const local = fakeLocalStorage();
    const mirror = fakeMirror();
    const store = new DurableProgressStore(new LocalProgressStore(local), mirror);

    store.saveProgress(studiedState());
    await settled(store);
    store.clear();
    await settled(store);

    assert.equal(mirror.data.size, 0);

    const fresh = new DurableProgressStore(new LocalProgressStore(local), mirror);
    assert.equal(await fresh.hydrate(), false);
    assert.equal(isPristineProgress(fresh.loadProgress()), true);
  });

  test('a corrupt mirror record is ignored rather than crashing the boot', async () => {
    const local = fakeLocalStorage();
    const mirror = fakeMirror();
    await mirror.set(STORAGE_KEYS.progress, { savedAt: 'whenever', value: { attempts: 'not an array' } });

    const store = new DurableProgressStore(new LocalProgressStore(local), mirror);
    assert.equal(await store.hydrate(), false);
    assert.equal(isPristineProgress(store.loadProgress()), true);
  });

  test('with no mirror at all the store still works, just without the guarantee', async () => {
    const local = fakeLocalStorage();
    const store = new DurableProgressStore(new LocalProgressStore(local), null);

    store.saveProgress(studiedState());
    assert.equal(store.loadProgress().attempts.length, 2);
    assert.equal(await store.hydrate(), false);
    assert.equal(store.diagnostics().mirrorAvailable, false);
  });
});

/* ────────────────────────────────────────────────────────────────── backups */

describe('backup file', () => {
  test('a backup round-trips through text unchanged', () => {
    const backup = createBackup(studiedState(), onboardedPreferences(), new Date('2026-09-15T09:00:00.000Z'));
    const parsed = parseBackup(serializeBackup(backup));

    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    assert.deepEqual(parsed.backup.progress, backup.progress);
    assert.deepEqual(parsed.backup.preferences, backup.preferences);
    assert.equal(parsed.backup.exportedAt, '2026-09-15T09:00:00.000Z');
  });

  test('the summary describes the file in the learner’s terms', () => {
    const summary = summarize(createBackup(studiedState(), onboardedPreferences()));
    assert.equal(summary.answers, 2);
    assert.equal(summary.lessonsCompleted, 1);
    assert.equal(summary.studyDays, 1);
  });

  test('the filename is dated and sortable', () => {
    assert.equal(backupFilename(new Date('2026-09-15T23:30:00.000Z')), 'loop-backup-2026-09-15.json');
  });

  test('nonsense is rejected with a reason, never half-applied', () => {
    assert.deepEqual(parseBackup('{not json'), { ok: false, problem: 'unreadable' });
    assert.deepEqual(parseBackup('"a string"'), { ok: false, problem: 'notABackup' });
    assert.deepEqual(parseBackup('{"format":"something-else"}'), { ok: false, problem: 'notABackup' });
    assert.deepEqual(parseBackup('{"format":"loop.backup","version":99,"progress":{}}'), {
      ok: false,
      problem: 'unsupportedVersion',
    });
    assert.deepEqual(
      parseBackup('{"format":"loop.backup","version":1,"progress":{"attempts":"nope"}}'),
      { ok: false, problem: 'invalidProgress' },
    );
  });

  test('missing preferences degrade to defaults instead of failing the import', () => {
    const text = JSON.stringify({
      format: 'loop.backup',
      version: 1,
      exportedAt: '2026-09-15T09:00:00.000Z',
      progress: studiedState(),
    });
    const parsed = parseBackup(text);
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    assert.equal(parsed.backup.preferences.onboarded, false);
    assert.equal(parsed.backup.progress.attempts.length, 2);
  });
});
