import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { dueItems, isDue, REVIEW_INTERVALS_DAYS, SimpleSpacedRepetition } from '../../src/core/review/ReviewScheduler.ts';
import type { ReviewItem } from '../../src/core/progress/models.ts';

const scheduler = new SimpleSpacedRepetition();
const now = new Date('2026-01-01T10:00:00.000Z');
const daysBetween = (iso: string) => Math.round((Date.parse(iso) - now.getTime()) / 86_400_000);

describe('spaced repetition ladder', () => {
  test('a wrong answer schedules the item for tomorrow', () => {
    const outcome = scheduler.next(null, false, now);
    assert.equal(outcome.reviewStage, 0);
    assert.equal(daysBetween(outcome.nextReviewAt), 1);
  });

  test('walks 1 → 3 → 7 → 14 → 30 on consecutive correct answers', () => {
    let stage = scheduler.next(null, false, now);
    const intervals = [daysBetween(stage.nextReviewAt)];
    for (let i = 0; i < 4; i += 1) {
      stage = scheduler.next(stage, true, now);
      intervals.push(daysBetween(stage.nextReviewAt));
    }
    assert.deepEqual(intervals, [1, 3, 7, 14, 30]);
  });

  test('stays at the top of the ladder once mastered', () => {
    const mastered = { reviewStage: REVIEW_INTERVALS_DAYS.length - 1 };
    const outcome = scheduler.next(mastered, true, now);
    assert.equal(outcome.reviewStage, REVIEW_INTERVALS_DAYS.length - 1);
    assert.equal(daysBetween(outcome.nextReviewAt), 30);
  });

  test('a lapse sends a mastered item back to one day', () => {
    const outcome = scheduler.next({ reviewStage: 4 }, false, now);
    assert.equal(outcome.reviewStage, 0);
    assert.equal(daysBetween(outcome.nextReviewAt), 1);
  });
});

describe('due queue', () => {
  const item = (id: string, offsetDays: number, lapses = 0): ReviewItem => ({
    exerciseId: id,
    lessonId: 'l',
    subjectId: 's',
    nextReviewAt: new Date(now.getTime() + offsetDays * 86_400_000).toISOString(),
    reviewStage: 0,
    lapses,
  });

  test('an item is due once its timestamp has passed', () => {
    assert.equal(isDue(item('a', -1), now), true);
    assert.equal(isDue(item('b', 1), now), false);
  });

  test('orders by lapses first, then by how overdue the item is', () => {
    const queue = [item('easy', -1, 0), item('hard', -0.5, 3), item('future', 2, 9), item('older', -5, 0)];
    assert.deepEqual(
      dueItems(queue, now).map((i) => i.exerciseId),
      ['hard', 'older', 'easy'],
    );
  });
});
