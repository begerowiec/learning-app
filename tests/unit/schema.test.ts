import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { ExerciseSchema, LessonSchema } from '../../src/core/domain/schema.ts';

/** The exact lesson shape from the specification, verbatim. */
const specLesson = {
  id: 'python-functions-basics',
  subject: 'python',
  level: 'beginner',
  module: 'python-basics',
  title: 'Functions',
  description: 'Learn the basics of Python functions.',
  estimatedMinutes: 8,
  content: [{ type: 'theory', title: 'What is a function?', body: 'A function is a reusable block of code.' }],
  exercises: [
    {
      id: 'functions-001',
      type: 'multiple_choice',
      question: 'Which keyword is used to define a function in Python?',
      answers: [
        { id: 'a', text: 'function' },
        { id: 'b', text: 'def' },
        { id: 'c', text: 'func' },
      ],
      correctAnswer: 'b',
      explanation: 'Python uses the def keyword to define functions.',
      tags: ['functions', 'syntax'],
      difficulty: 2,
      estimatedSeconds: 30,
    },
  ],
};

describe('lesson schema', () => {
  test('accepts the shape from the specification', () => {
    const result = LessonSchema.safeParse(specLesson);
    assert.ok(result.success, result.success ? '' : JSON.stringify(result.issues));
  });

  test('applies defaults for optional metadata', () => {
    const result = LessonSchema.safeParse(specLesson);
    assert.ok(result.success);
    if (!result.success) return;
    assert.equal(result.data.order, 0);
    assert.deepEqual(result.data.tags, []);
  });

  test('rejects duplicate exercise ids inside a lesson', () => {
    const lesson = { ...specLesson, exercises: [specLesson.exercises[0], specLesson.exercises[0]] };
    const result = LessonSchema.safeParse(lesson);
    assert.equal(result.success, false);
    if (result.success) return;
    assert.match(result.issues.map((i) => i.message).join(' '), /duplicate exercise ids/);
  });
});

describe('exercise schema', () => {
  const base = { id: 'x-001', explanation: 'because', tags: ['t'] };

  test('rejects a correctAnswer that is not one of the answers', () => {
    const result = ExerciseSchema.safeParse({
      ...base,
      type: 'multiple_choice',
      question: 'Q?',
      answers: [
        { id: 'a', text: 'one' },
        { id: 'b', text: 'two' },
      ],
      correctAnswer: 'z',
    });
    assert.equal(result.success, false);
  });

  test('rejects a fill_blank sentence with no blank marker', () => {
    const result = ExerciseSchema.safeParse({
      ...base,
      type: 'fill_blank',
      question: 'Complete',
      sentence: 'no blank here',
      answers: [
        { id: 'a', text: 'x' },
        { id: 'b', text: 'y' },
      ],
      correctAnswer: 'a',
    });
    assert.equal(result.success, false);
  });

  test('rejects unknown fields, which is how hallucinated content is caught', () => {
    const result = ExerciseSchema.safeParse({
      ...base,
      type: 'true_false',
      question: 'S',
      correctAnswer: true,
      madeUpField: 'invented',
    });
    assert.equal(result.success, false);
    if (result.success) return;
    assert.match(result.issues.map((i) => i.message).join(' '), /unrecognized key/);
  });

  test('rejects an unknown exercise type', () => {
    const result = ExerciseSchema.safeParse({ ...base, type: 'essay' });
    assert.equal(result.success, false);
  });

  test('accepts audio metadata, so listening work needs no migration', () => {
    const result = ExerciseSchema.safeParse({
      ...base,
      type: 'translation',
      question: 'Translate',
      sentence: 'Have you ever been to Japan?',
      sourceLanguage: 'en',
      targetLanguage: 'pl',
      answers: [
        { id: 'a', text: 'Czy byłeś kiedyś w Japonii?', audio: { url: '/audio/a.mp3' } },
        { id: 'b', text: 'Czy jedziesz do Japonii?' },
      ],
      correctAnswer: 'a',
      audio: { url: '/audio/q.mp3', locale: 'en-GB', transcript: 'Have you ever been to Japan?', expectsSpeech: false },
    });
    assert.ok(result.success, result.success ? '' : JSON.stringify(result.issues));
  });
});
