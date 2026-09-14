/**
 * Spaced repetition.
 *
 * The MVP ladder is the one from the spec: a wrong answer schedules the item
 * for tomorrow, and each subsequent correct answer pushes it out to 3, 7, 14
 * and finally 30 days. It is deliberately the simplest thing that produces a
 * useful review queue.
 *
 * `ReviewScheduler` is an interface so that replacing this with SM-2, FSRS or
 * anything else is a one-line swap in the composition root — nothing else in
 * the app knows how an interval is chosen.
 */
import type { ReviewItem } from '../progress/models.ts';

export interface ReviewOutcome {
  nextReviewAt: string;
  reviewStage: number;
}

export interface ReviewScheduler {
  readonly name: string;
  /**
   * @param current  the item's existing schedule, or null the first time it is
   *                 answered wrong and enters the queue
   * @param correct  whether this answer was right
   */
  next(current: Pick<ReviewItem, 'reviewStage'> | null, correct: boolean, now: Date): ReviewOutcome;
}

/** Days between reviews, indexed by stage. */
export const REVIEW_INTERVALS_DAYS = [1, 3, 7, 14, 30] as const;
export const MAX_REVIEW_STAGE = REVIEW_INTERVALS_DAYS.length - 1;

const DAY_MS = 24 * 60 * 60 * 1000;

export class SimpleSpacedRepetition implements ReviewScheduler {
  readonly name = 'simple-ladder';

  next(current: Pick<ReviewItem, 'reviewStage'> | null, correct: boolean, now: Date): ReviewOutcome {
    // A wrong answer always sends the item back to the bottom of the ladder.
    const stage = correct ? Math.min((current?.reviewStage ?? -1) + 1, MAX_REVIEW_STAGE) : 0;
    const days = REVIEW_INTERVALS_DAYS[stage] ?? REVIEW_INTERVALS_DAYS[0];
    return {
      reviewStage: stage,
      nextReviewAt: new Date(now.getTime() + days * DAY_MS).toISOString(),
    };
  }
}

export function isDue(item: Pick<ReviewItem, 'nextReviewAt'>, now: Date = new Date()): boolean {
  return new Date(item.nextReviewAt).getTime() <= now.getTime();
}

/** Due items, hardest first: more lapses, then longest overdue. */
export function dueItems(queue: ReviewItem[], now: Date = new Date()): ReviewItem[] {
  return queue
    .filter((item) => isDue(item, now))
    .sort((a, b) => b.lapses - a.lapses || Date.parse(a.nextReviewAt) - Date.parse(b.nextReviewAt));
}
