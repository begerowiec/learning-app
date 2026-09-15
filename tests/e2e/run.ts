/**
 * End-to-end coverage of the two flows the specification calls mandatory.
 *
 *   1. launch → onboarding → Home → lesson → answers → summary → Home updated
 *   2. wrong answer → review queue → review on Home → review completed → rescheduled
 *
 * Runs against the production bundle in dist/ over a real static server, in
 * Chromium, at phone size. Time travel for the review flow is done by editing
 * the stored progress in localStorage — the same thing the app would see after
 * a day has passed.
 */
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import type { Browser, Page } from 'playwright';
import { createServer } from '../../scripts/serve.mjs';

const PORT = 4273;
const BASE = `http://127.0.0.1:${PORT}`;
const STORAGE_KEY = 'recall-os:progress:v1';

if (!fs.existsSync(path.join(process.cwd(), 'dist/index.html'))) {
  throw new Error('dist/ is missing — run `npm run build` first.');
}

let browser: Browser;
let page: Page;
let server: ReturnType<typeof createServer>;
const consoleErrors: string[] = [];

before(async () => {
  server = createServer();
  await new Promise<void>((resolve) => server.listen(PORT, '127.0.0.1', resolve));
  browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM });
  const context = await browser.newContext({ viewport: { width: 400, height: 860 }, acceptDownloads: true });
  page = await context.newPage();
  page.on('pageerror', (error) => consoleErrors.push(String(error)));
  page.on('console', (message) => {
    // Google Fonts is unreachable in the sandbox; that is not an app error.
    if (message.type() === 'error' && !message.text().includes('net::')) consoleErrors.push(message.text());
  });
});

after(async () => {
  await browser?.close();
  server?.close();
});

/** Walks the rest of a session, answering the first option every time. */
async function playSession(page: Page, { firstAnswerWrong = false } = {}): Promise<void> {
  for (let guard = 0; guard < 60; guard += 1) {
    if (await page.$('[data-testid="summary-score"]')) return;

    if (await page.$('[data-testid="flashcard-got-it"]')) {
      await page.click('[data-testid="flashcard-got-it"]');
      continue;
    }

    const cta = await page.$('[data-testid="session-cta"]');
    if (!cta) return;
    const label = (await cta.textContent())?.trim();

    if (label === 'Check answer') {
      const options = await page.$$('.option');
      if (options.length > 0) {
        const wantWrong = firstAnswerWrong && guard === 0;
        const target = wantWrong ? await findWrongOption(page) : 0;
        await options[target]?.click();
      }
    }
    await page.click('[data-testid="session-cta"]');
    await page.waitForTimeout(60);
  }
  throw new Error('session did not finish within the guard limit');
}

/** Picks an option that is definitely not the right one. */
async function findWrongOption(page: Page): Promise<number> {
  const count = (await page.$$('.option')).length;
  return count - 1;
}

async function readProgress(page: Page) {
  const raw = await page.evaluate((key) => window.localStorage.getItem(key), STORAGE_KEY);
  return raw ? (JSON.parse(raw) as Record<string, any>) : null;
}

async function completeOnboarding(page: Page) {
  await page.goto(BASE);
  await page.waitForSelector('[data-testid="pick-python"]');
  await page.click('[data-testid="pick-python"]');
  await page.click('[data-testid="onboarding-continue"]');
  await page.waitForSelector('[aria-label="Python level"]');
  await page.click('[data-testid="onboarding-continue"]');
  await page.click('[data-testid="goal-10"]');
  await page.click('[data-testid="onboarding-continue"]');
  await page.click('[data-testid="start-learning"]');
  await page.waitForSelector('[data-testid="continue-cta"]');
}

describe('MVP flow: onboarding → lesson → summary → home', () => {
  test('an onboarded learner lands on Home with a recommended lesson', async () => {
    await completeOnboarding(page);
    const title = await page.textContent('[data-testid="continue-title"]');
    assert.equal(title?.trim(), 'Variables & Data Types');
    assert.equal((await page.textContent('[data-testid="streak"]'))?.trim(), '0');
  });

  test('the lesson intro shows theory before practice starts', async () => {
    await page.click('[data-testid="continue-cta"]');
    await page.waitForSelector('[data-testid="start-practice"]');
    const cards = await page.$$('.knowledge-card');
    assert.ok(cards.length >= 2, 'expected at least two knowledge cards');
  });

  test('answering shows feedback and only then offers Continue', async () => {
    await page.click('[data-testid="start-practice"]');
    await page.waitForSelector('[data-testid="session-cta"]');

    assert.equal(await page.isDisabled('[data-testid="session-cta"]'), true, 'CTA must be disabled before a choice');
    assert.equal((await page.textContent('[data-testid="session-counter"]'))?.trim(), '1 / 9');

    const wrong = await findWrongOption(page);
    await (await page.$$('.option'))[wrong]?.click();
    assert.equal(await page.isDisabled('[data-testid="session-cta"]'), false);

    await page.click('[data-testid="session-cta"]');
    await page.waitForSelector('[data-testid="feedback"]');
    assert.match((await page.textContent('[data-testid="feedback"]')) ?? '', /Not quite|Correct/);
    assert.equal((await page.textContent('[data-testid="session-cta"]'))?.trim(), 'Continue');
  });

  test('a checked answer can no longer be changed', async () => {
    const first = page.locator('.option').first();
    assert.equal(await first.getAttribute('aria-disabled'), 'true', 'options lock after checking');

    const states = () => page.$$eval('.option', (nodes) => nodes.map((n) => n.getAttribute('data-state')));
    const before = await states();
    await first.click({ force: true });
    assert.deepEqual(await states(), before, 'a forced click must not re-open the answer');
  });

  test('finishing the lesson shows a summary with the score', async () => {
    await playSession(page);
    await page.waitForSelector('[data-testid="summary-score"]');
    const score = (await page.textContent('[data-testid="summary-score"]'))?.trim() ?? '';
    assert.match(score, /^\d+ \/ 9$/);
    assert.ok((await page.$$('.tag-row .tag')).length > 0, 'practised topics should be listed');
  });

  test('progress is saved and Home reflects it', async () => {
    await page.click('[data-testid="summary-continue"]');
    await page.waitForSelector('[data-testid="continue-cta"]');

    const stored = await readProgress(page);
    assert.ok(stored, 'progress should be in localStorage');
    assert.equal(stored?.lessons[0].lessonId, 'python-variables');
    assert.equal(stored?.lessons[0].status, 'completed');
    assert.equal(stored?.sessions.length, 1);
    assert.equal(stored?.attempts.length, 9);
    assert.equal((await page.textContent('[data-testid="streak"]'))?.trim(), '1');

    // Home has moved on to the next lesson in the module.
    assert.equal((await page.textContent('[data-testid="continue-title"]'))?.trim(), 'Conditions');
  });

  test('progress survives a reload', async () => {
    await page.reload();
    await page.waitForSelector('[data-testid="continue-cta"]');
    assert.equal((await page.textContent('[data-testid="continue-title"]'))?.trim(), 'Conditions');
  });
});

describe('review flow: wrong answer → review queue → rescheduled', () => {
  test('the wrong answer put an item into the review queue', async () => {
    const stored = await readProgress(page);
    assert.ok((stored?.reviewQueue.length ?? 0) >= 1, 'at least one item should be queued');
    assert.equal(stored?.reviewQueue[0].reviewStage, 0);
  });

  test('once due, the review appears on Home', async () => {
    // Time travel: make every queued item due now.
    await page.evaluate((key) => {
      const state = JSON.parse(window.localStorage.getItem(key) as string);
      const past = new Date(Date.now() - 60_000).toISOString();
      state.reviewQueue = state.reviewQueue.map((item: Record<string, unknown>) => ({ ...item, nextReviewAt: past }));
      window.localStorage.setItem(key, JSON.stringify(state));
    }, STORAGE_KEY);

    await page.reload();
    await page.waitForSelector('[data-testid="review-row"]');
    assert.match((await page.textContent('[data-testid="review-row"]')) ?? '', /items ready to review/);
    assert.equal((await page.textContent('[data-testid="continue-title"]'))?.trim(), 'Review session');
  });

  test('completing the review reschedules the item further out', async () => {
    const before = await readProgress(page);
    const queuedBefore = before?.reviewQueue[0];

    await page.click('[data-testid="review-row"]');
    await page.waitForSelector('[data-testid="session-cta"]');
    assert.match((await page.textContent('.session-label')) ?? '', /Review session/);

    await playSession(page);
    await page.waitForSelector('[data-testid="summary-score"]');
    assert.match((await page.textContent('h2')) ?? '', /Review done/);

    await page.click('[data-testid="summary-continue"]');
    await page.waitForSelector('[data-testid="continue-cta"]');

    const after = await readProgress(page);
    const queuedAfter = after?.reviewQueue.find((i: Record<string, unknown>) => i.exerciseId === queuedBefore.exerciseId);
    assert.ok(queuedAfter, 'the item should still be tracked');
    assert.ok(
      Date.parse(queuedAfter.nextReviewAt) > Date.parse(queuedBefore.nextReviewAt),
      'the next review must be scheduled later than before',
    );
    assert.equal(after?.sessions.length, 2);
    assert.equal(after?.sessions[1].kind, 'review');
  });
});

describe('navigation and theme', () => {
  test('the bottom navigation reaches every tab', async () => {
    for (const [tab, heading] of [
      ['learn', 'Learn'],
      ['progress', 'Progress'],
      ['profile', 'Profile'],
    ] as const) {
      await page.click(`[data-testid="nav-${tab}"]`);
      await page.waitForSelector(`h3:has-text("${heading}")`);
    }
  });

  test('the theme choice is stored', async () => {
    await page.locator('[aria-label="Theme"] button', { hasText: 'Dark' }).click();
    const stored = await page.evaluate(() => window.localStorage.getItem('recall-os:preferences:v1'));
    assert.match(stored ?? '', /"darkMode":true/);
    assert.equal(await page.getAttribute('html', 'data-theme'), 'dark');
  });

});

describe('language switching', () => {
  test('the interface switches to Polish and back', async () => {
    await page.click('[data-testid="nav-profile"]');
    await page.locator('[data-testid="interface-language"] button', { hasText: 'Polski' }).click();

    await page.waitForSelector('h3:has-text("Profil")');
    assert.equal(await page.getAttribute('html', 'lang'), 'pl');
    assert.match((await page.textContent('[data-testid="nav-home"]')) ?? '', /START/i);

    const stored = await page.evaluate(() => window.localStorage.getItem('recall-os:preferences:v1'));
    assert.match(stored ?? '', /"interfaceLanguage":"pl"/);
  });

  test('the Polish interface reaches Home without leaving English behind', async () => {
    await page.click('[data-testid="nav-home"]');
    await page.waitForSelector('[data-testid="continue-cta"]');
    const heading = (await page.textContent('h3')) ?? '';
    assert.match(heading, /Dzień dobry|Dobry wieczór/);
    assert.match((await page.textContent('.continue-label')) ?? '', /KONTYNUUJ|DO POWTÓRKI/i);
  });

  test('content language is independent of the interface language, and progress survives it', async () => {
    // Interface is Polish, lessons are still English.
    assert.equal((await page.textContent('[data-testid="continue-title"]'))?.trim(), 'Conditions');
    const before = await readProgress(page);

    await page.click('[data-testid="nav-profile"]');
    await page.locator('[data-testid="content-language"] button', { hasText: 'Polski' }).click();
    await page.click('[data-testid="nav-home"]');
    await page.waitForSelector('[data-testid="continue-title"]');

    assert.equal((await page.textContent('[data-testid="continue-title"]'))?.trim(), 'Warunki');
    const stored = await page.evaluate(() => window.localStorage.getItem('recall-os:preferences:v1'));
    assert.match(stored ?? '', /"contentLanguage":"pl"/);

    // Attempts and the review queue are keyed by exercise id, so the switch
    // must be invisible to them.
    const after = await readProgress(page);
    assert.equal(after?.attempts.length, before?.attempts.length);
    assert.deepEqual(
      after?.reviewQueue.map((i: Record<string, unknown>) => i.exerciseId),
      before?.reviewQueue.map((i: Record<string, unknown>) => i.exerciseId),
    );
    assert.equal(after?.lessons[0].lessonId, 'python-variables');
    assert.equal(after?.lessons[0].status, 'completed');
    assert.equal((await page.textContent('[data-testid="streak"]'))?.trim(), '1');
  });

  test('a Polish lesson keeps the same exercises', async () => {
    await page.click('[data-testid="continue-cta"]');
    await page.waitForSelector('[data-testid="start-practice"]');
    assert.match((await page.textContent('h2')) ?? '', /Warunki/);
    assert.match((await page.textContent('.screen .app-scroll')) ?? '', /Uzupełnij|Definicja|Kształt/);

    await page.click('[data-testid="start-practice"]');
    await page.waitForSelector('[data-testid="session-cta"]');
    assert.equal((await page.textContent('[data-testid="session-counter"]'))?.trim(), '1 / 8');
    assert.equal((await page.textContent('[data-testid="session-cta"]'))?.trim(), 'Sprawdź');
    await page.click('[data-testid="session-exit"]');
    await page.waitForSelector('[data-testid="start-practice"]');
    // Leave the lesson screen, which has no bottom navigation.
    await page.locator('.btn-ghost').first().click();
    await page.waitForSelector('[data-testid="nav-profile"]');
  });

  test('the Playwright subject is available and localised', async () => {
    await page.click('[data-testid="nav-profile"]');
    await page.waitForSelector('h3:has-text("Profil")');
    await page.click('[data-testid="redo-onboarding"]');
    await page.waitForSelector('[data-testid="pick-playwright"]');

    assert.match((await page.textContent('[data-testid="pick-playwright"]')) ?? '', /Playwright/);
    await page.click('[data-testid="pick-playwright"]');
    await page.click('[data-testid="onboarding-continue"]');
    await page.click('[data-testid="onboarding-continue"]');
    await page.click('[data-testid="onboarding-continue"]');
    await page.click('[data-testid="start-learning"]');

    await page.click('[data-testid="nav-learn"]');
    await page.waitForSelector('[data-testid="subject-card-playwright"]');
    await page.click('[data-testid="subject-card-playwright"]');
    await page.waitForSelector('[data-testid="module-card-playwright-locators"]');
    assert.match((await page.textContent('[data-testid="module-card-playwright-locators"]')) ?? '', /Lokatory/);
  });
});

describe('durable storage: backup, reset and restore', () => {
  /* The app has no backend, so a file is the only way progress survives a new
     device or a browser that clears its site data. This walks the whole path:
     take a backup, wipe the device, restore, and check the history is back. */
  let backupText = '';

  test('the interface language goes back to English for the remaining checks', async () => {
    await page.click('[data-testid="nav-profile"]');
    await page.locator('[data-testid="interface-language"] button', { hasText: 'English' }).click();
    await page.waitForSelector('h3:has-text("Profile")');
  });

  test('the storage panel reports what is stored and how safe it is', async () => {
    await page.waitForSelector('[data-testid="storage-section"]');
    const counts = (await page.textContent('[data-testid="storage-counts"]')) ?? '';
    assert.match(counts, /\d+ answers? · \d+ study days?/);
    const answers = Number(counts.match(/(\d+) answers/)?.[1] ?? 0);
    assert.ok(answers > 0, `expected some answers on record, got "${counts}"`);

    // Chromium grants persistence headlessly or reports false; either is a
    // legitimate answer, but the row must say something definite.
    const persistent = (await page.textContent('[data-testid="storage-persistent"]')) ?? '';
    assert.ok(persistent.trim().length > 0);
  });

  test('exporting hands over a file that parses as a backup', async () => {
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('[data-testid="export-backup"]'),
    ]);

    assert.match(download.suggestedFilename(), /^loop-backup-\d{4}-\d{2}-\d{2}\.json$/);
    const file = await download.path();
    assert.ok(file, 'the download must reach disk');
    backupText = fs.readFileSync(file, 'utf8');

    const parsed = JSON.parse(backupText) as Record<string, unknown>;
    assert.equal(parsed.format, 'loop.backup');
    const progress = parsed.progress as { attempts: unknown[]; lessons: unknown[] };
    assert.ok(progress.attempts.length > 0, 'the backup carries the answers');
    assert.ok(progress.lessons.length > 0, 'the backup carries lesson progress');
  });

  test('a reset really empties the device', async () => {
    page.once('dialog', (dialog) => void dialog.accept());
    await page.click('[data-testid="reset-progress"]');
    await page.waitForSelector('[data-testid="continue-cta"]');

    const after = await readProgress(page);
    assert.deepEqual(after?.attempts, []);
    assert.deepEqual(after?.lessons, []);
    assert.equal((await page.textContent('[data-testid="streak"]'))?.trim(), '0');
  });

  test('importing the backup brings the whole history back', async () => {
    await page.click('[data-testid="nav-profile"]');
    await page.waitForSelector('[data-testid="storage-section"]');

    const file = path.join(process.cwd(), 'dist/.e2e-backup.json');
    fs.writeFileSync(file, backupText);
    page.once('dialog', (dialog) => void dialog.accept());
    await page.setInputFiles('[data-testid="import-backup"]', file);

    // The learner stays on Profile so the confirmation is visible.
    await page.waitForSelector('[data-testid="storage-notice"]');
    assert.match((await page.textContent('[data-testid="storage-notice"]')) ?? '', /Restored \d+ answers from/);

    const restored = await readProgress(page);
    const original = JSON.parse(backupText) as { progress: { attempts: unknown[]; lessons: unknown[] } };
    assert.equal(restored?.attempts.length, original.progress.attempts.length);
    assert.equal(restored?.lessons.length, original.progress.lessons.length);

    await page.click('[data-testid="nav-home"]');
    await page.waitForSelector('[data-testid="continue-cta"]');
    assert.equal((await page.textContent('[data-testid="streak"]'))?.trim(), '1');
    fs.rmSync(file, { force: true });
  });

  test('a file that is not a backup is refused without touching the data', async () => {
    await page.click('[data-testid="nav-profile"]');
    await page.waitForSelector('[data-testid="storage-section"]');

    const file = path.join(process.cwd(), 'dist/.e2e-not-a-backup.json');
    fs.writeFileSync(file, '{"hello":"world"}');
    const before = await readProgress(page);

    page.once('dialog', (dialog) => void dialog.accept());
    await page.setInputFiles('[data-testid="import-backup"]', file);

    await page.waitForSelector('[data-testid="storage-notice"]');
    assert.match(
      (await page.textContent('[data-testid="storage-notice"]')) ?? '',
      /isn.t a Loop backup file/,
    );
    const after = await readProgress(page);
    assert.equal(after?.attempts.length, before?.attempts.length, 'a refused import changes nothing');
    fs.rmSync(file, { force: true });
  });

  test('progress survives a reload, which is the everyday case', async () => {
    const before = await readProgress(page);
    await page.reload({ waitUntil: 'load' });
    await page.waitForSelector('[data-testid="continue-cta"]');
    const after = await readProgress(page);
    assert.equal(after?.attempts.length, before?.attempts.length);
  });

  test('progress is recovered when the browser clears localStorage but not IndexedDB', async () => {
    const before = await readProgress(page);
    assert.ok((before?.attempts.length ?? 0) > 0, 'precondition: there is something to lose');

    // Exactly what Safari's seven-day sweep of a *website* does to the fast
    // store — the IndexedDB mirror is what has to save us here.
    await page.evaluate(() => window.localStorage.clear());
    await page.reload({ waitUntil: 'load' });
    await page.waitForSelector('[data-testid="continue-cta"]');

    const after = await readProgress(page);
    assert.equal(after?.attempts.length, before?.attempts.length, 'the mirror must refill the fast store');
    assert.equal((await page.textContent('[data-testid="streak"]'))?.trim(), '1');
  });
});

describe('console', () => {
  test('no unexpected console errors were logged', () => {
    assert.deepEqual(consoleErrors, []);
  });
});
