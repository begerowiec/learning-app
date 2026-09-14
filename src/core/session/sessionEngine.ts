/**
 * The session state machine — one flow for every exercise type.
 *
 * UI answer states from the spec map onto this directly:
 *   unanswered → selected → correct | incorrect → completed
 *
 * Two rules are enforced here rather than in the components, because they are
 * behaviour and not presentation: a selection cannot be changed once it has
 * been checked, and the main CTA turns into "Continue" only after feedback has
 * been shown.
 */
import type { Exercise } from '../domain/schema.ts';
import { correctOptionId, grade, isSelfGraded, type Response } from './grading.ts';

export type AnswerState = 'unanswered' | 'selected' | 'correct' | 'incorrect' | 'completed';

/**
 * The context line a review session shows above the question. It is data, not
 * a sentence: core never produces user-facing prose, because the UI may be
 * running in a different language than the content.
 */
export type ReviewNote =
  | { kind: 'added' }
  | { kind: 'seenToday' }
  | { kind: 'seenDaysAgo'; count: number }
  | { kind: 'wrongTimes'; count: number };

export interface SessionItem {
  exercise: Exercise;
  lessonId: string;
  subjectId: string;
  /** Present only in review sessions. */
  note?: ReviewNote;
}

export interface ItemResult {
  exerciseId: string;
  topic: string;
  tags: string[];
  correct: boolean;
  durationSeconds: number;
}

export interface SessionState {
  id: string;
  kind: 'lesson' | 'review';
  label: string;
  lessonId?: string;
  subjectId?: string;
  items: SessionItem[];
  index: number;
  /** The option the learner has tapped but not yet checked. */
  selectedOptionId: string | null;
  checked: boolean;
  /** Flashcards only. */
  flipped: boolean;
  results: ItemResult[];
  startedAt: number;
  itemStartedAt: number;
  finished: boolean;
}

export interface StartSessionInput {
  id: string;
  kind: 'lesson' | 'review';
  label: string;
  items: SessionItem[];
  lessonId?: string;
  subjectId?: string;
  /** Resume position when continuing a persisted session. */
  startIndex?: number;
  previousResults?: ItemResult[];
  now?: number;
}

export function startSession(input: StartSessionInput): SessionState {
  const now = input.now ?? Date.now();
  const startIndex = Math.min(input.startIndex ?? 0, Math.max(0, input.items.length - 1));
  return {
    id: input.id,
    kind: input.kind,
    label: input.label,
    lessonId: input.lessonId,
    subjectId: input.subjectId,
    items: input.items,
    index: startIndex,
    selectedOptionId: null,
    checked: false,
    flipped: false,
    results: input.previousResults ?? [],
    startedAt: now,
    itemStartedAt: now,
    finished: input.items.length === 0,
  };
}

export function currentItem(state: SessionState): SessionItem | null {
  return state.items[state.index] ?? null;
}

/** Tapping an option. Ignored once the answer has been checked. */
export function selectOption(state: SessionState, optionId: string): SessionState {
  if (state.checked) return state;
  return { ...state, selectedOptionId: optionId };
}

export function flipCard(state: SessionState): SessionState {
  return { ...state, flipped: !state.flipped };
}

export interface CheckResult {
  state: SessionState;
  /** Present when this check produced a graded answer. */
  outcome: { exercise: Exercise; item: SessionItem; correct: boolean; durationSeconds: number } | null;
}

/**
 * Grades the current answer. For a flashcard, `response` carries the learner's
 * own verdict; for everything else the selected option is used.
 */
export function checkAnswer(state: SessionState, response?: Response, now: number = Date.now()): CheckResult {
  const item = currentItem(state);
  if (!item || state.checked) return { state, outcome: null };

  const resolved: Response | null =
    response ?? (state.selectedOptionId ? { kind: 'option', optionId: state.selectedOptionId } : null);
  if (!resolved) return { state, outcome: null };

  const correct = grade(item.exercise, resolved);
  const durationSeconds = Math.max(0, Math.round((now - state.itemStartedAt) / 1000));
  const result: ItemResult = {
    exerciseId: item.exercise.id,
    topic: item.exercise.topic ?? item.exercise.type,
    tags: item.exercise.tags,
    correct,
    durationSeconds,
  };

  return {
    state: {
      ...state,
      checked: true,
      selectedOptionId: resolved.kind === 'option' ? resolved.optionId : state.selectedOptionId,
      results: [...state.results, result],
    },
    outcome: { exercise: item.exercise, item, correct, durationSeconds },
  };
}

/** Moves to the next exercise, or marks the session finished. */
export function advance(state: SessionState, now: number = Date.now()): SessionState {
  const nextIndex = state.index + 1;
  if (nextIndex >= state.items.length) return { ...state, finished: true, checked: true };
  return {
    ...state,
    index: nextIndex,
    selectedOptionId: null,
    checked: false,
    flipped: false,
    itemStartedAt: now,
  };
}

/* ───────────────────────────────────────────────── derived view-model helpers */

export function answerState(state: SessionState, optionId: string): AnswerState {
  const item = currentItem(state);
  if (!item) return 'completed';
  const isSelected = state.selectedOptionId === optionId;
  if (!state.checked) return isSelected ? 'selected' : 'unanswered';
  if (optionId === correctOptionId(item.exercise)) return 'correct';
  return isSelected ? 'incorrect' : 'unanswered';
}

export function canCheck(state: SessionState): boolean {
  const item = currentItem(state);
  if (!item) return false;
  if (isSelfGraded(item.exercise)) return true;
  return state.selectedOptionId !== null;
}

export function isLastItem(state: SessionState): boolean {
  return state.index >= state.items.length - 1;
}

/** 0–100, counting a checked answer as progress into the next slot. */
export function progressPercent(state: SessionState): number {
  if (state.items.length === 0) return 0;
  const done = state.index + (state.checked ? 1 : 0);
  return Math.round((Math.min(done, state.items.length) / state.items.length) * 100);
}

export function sessionSummary(state: SessionState, now: number = Date.now()) {
  const total = state.results.length;
  const correct = state.results.filter((r) => r.correct).length;
  return {
    total,
    correct,
    incorrect: total - correct,
    accuracy: total === 0 ? 0 : Math.round((correct / total) * 100),
    durationSeconds: Math.max(0, Math.round((now - state.startedAt) / 1000)),
    practisedTopics: [...new Set(state.results.map((r) => r.topic))],
    weakTopics: [...new Set(state.results.filter((r) => !r.correct).map((r) => r.topic))],
  };
}
