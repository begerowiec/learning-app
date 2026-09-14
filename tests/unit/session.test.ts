import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import type { Exercise } from '../../src/core/domain/schema.ts';
import { correctAnswerText, correctOptionId, grade, optionsOf, typeLabel } from '../../src/core/session/grading.ts';
import {
  advance,
  answerState,
  canCheck,
  checkAnswer,
  progressPercent,
  selectOption,
  sessionSummary,
  startSession,
  type SessionItem,
} from '../../src/core/session/sessionEngine.ts';

const meta = { explanation: 'because', tags: ['t'], difficulty: 2, estimatedSeconds: 30 };
const twoAnswers = [
  { id: 'a', text: 'wrong' },
  { id: 'b', text: 'right' },
];

const choice = (id: string, type: Exercise['type']): Exercise =>
  ({
    ...meta,
    id,
    type,
    question: 'Q?',
    answers: twoAnswers,
    correctAnswer: 'b',
    ...(type === 'translation' ? { sentence: 'S', sourceLanguage: 'en', targetLanguage: 'pl' } : {}),
    ...(type === 'fill_blank' ? { sentence: 'a ___ b' } : {}),
    ...(type.startsWith('code') || type === 'find_error' ? { code: 'x = 1', language: 'python' } : {}),
  }) as unknown as Exercise;

const trueFalse = { ...meta, id: 'tf', type: 'true_false', question: 'S', correctAnswer: false } as unknown as Exercise;
const flashcard = { ...meta, id: 'fc', type: 'flashcard', front: 'F', back: 'B' } as unknown as Exercise;

const item = (exercise: Exercise): SessionItem => ({ exercise, lessonId: 'l1', subjectId: 'python' });

describe('grading normalises every type to option ids', () => {
  test('choice types expose their own answers', () => {
    const exercise = choice('mc', 'multiple_choice');
    assert.equal(optionsOf(exercise).length, 2);
    assert.equal(correctOptionId(exercise), 'b');
    assert.equal(correctAnswerText(exercise), 'right');
  });

  test('true_false is projected onto two synthetic options', () => {
    assert.deepEqual(
      optionsOf(trueFalse).map((o) => o.id),
      ['true', 'false'],
    );
    assert.equal(correctOptionId(trueFalse), 'false');
    assert.equal(grade(trueFalse, { kind: 'option', optionId: 'false' }), true);
    assert.equal(grade(trueFalse, { kind: 'option', optionId: 'true' }), false);
  });

  test('a flashcard has no options and is graded by the learner', () => {
    assert.deepEqual(optionsOf(flashcard), []);
    assert.equal(correctOptionId(flashcard), null);
    assert.equal(grade(flashcard, { kind: 'self', remembered: true }), true);
    assert.equal(grade(flashcard, { kind: 'self', remembered: false }), false);
  });

  test('every type has a human label', () => {
    const types: Exercise['type'][] = [
      'multiple_choice', 'true_false', 'fill_blank', 'translation', 'flashcard',
      'code_multiple_choice', 'code_completion', 'find_error', 'concept_question',
    ];
    for (const type of types) {
      const exercise = type === 'true_false' ? trueFalse : type === 'flashcard' ? flashcard : choice(`x-${type}`, type);
      assert.ok(typeLabel(exercise).length > 0, type);
    }
  });
});

describe('session engine', () => {
  const session = () =>
    startSession({
      id: 's1',
      kind: 'lesson',
      label: 'Python · Test',
      items: [item(choice('q1', 'multiple_choice')), item(choice('q2', 'concept_question'))],
      lessonId: 'l1',
      subjectId: 'python',
      now: 0,
    });

  test('an answer cannot be checked before something is selected', () => {
    assert.equal(canCheck(session()), false);
    assert.equal(canCheck(selectOption(session(), 'a')), true);
  });

  test('a selection is frozen once the answer is checked', () => {
    const picked = selectOption(session(), 'a');
    const { state } = checkAnswer(picked, undefined, 2000);
    const afterRetry = selectOption(state, 'b');
    assert.equal(afterRetry.selectedOptionId, 'a');
  });

  test('checking records a result with the time spent', () => {
    const { state, outcome } = checkAnswer(selectOption(session(), 'b'), undefined, 5000);
    assert.equal(outcome?.correct, true);
    assert.equal(outcome?.durationSeconds, 5);
    assert.equal(state.results.length, 1);
  });

  test('answer states drive the five UI states from the spec', () => {
    const picked = selectOption(session(), 'a');
    assert.equal(answerState(picked, 'a'), 'selected');
    assert.equal(answerState(picked, 'b'), 'unanswered');

    const { state } = checkAnswer(picked);
    assert.equal(answerState(state, 'a'), 'incorrect');
    assert.equal(answerState(state, 'b'), 'correct');
  });

  test('advancing resets per-question state and finishes at the end', () => {
    const { state } = checkAnswer(selectOption(session(), 'b'));
    const second = advance(state, 10_000);
    assert.equal(second.index, 1);
    assert.equal(second.selectedOptionId, null);
    assert.equal(second.checked, false);
    assert.equal(second.finished, false);

    const { state: checkedSecond } = checkAnswer(selectOption(second, 'a'));
    assert.equal(advance(checkedSecond).finished, true);
  });

  test('progress counts a checked answer as done', () => {
    const start = session();
    assert.equal(progressPercent(start), 0);
    const { state } = checkAnswer(selectOption(start, 'b'));
    assert.equal(progressPercent(state), 50);
  });

  test('the summary separates practised topics from the weak ones', () => {
    const first = checkAnswer(selectOption(session(), 'b')).state;
    const second = advance(first);
    const done = checkAnswer(selectOption(second, 'a'), undefined, 20_000).state;
    const summary = sessionSummary(done, 30_000);

    assert.equal(summary.total, 2);
    assert.equal(summary.correct, 1);
    assert.equal(summary.accuracy, 50);
    assert.equal(summary.durationSeconds, 30);
    assert.equal(summary.weakTopics.length, 1);
  });
});
