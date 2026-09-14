import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { recommendNext, type LessonRef } from '../../src/core/home/recommendation.ts';
import { emptyProgressState, type LessonProgress, type ProgressState } from '../../src/core/progress/models.ts';

function ref(id: string, subjectId = 'python'): LessonRef {
  return {
    lessonId: id,
    title: id,
    subjectId,
    subjectName: subjectId,
    moduleId: 'm',
    moduleTitle: 'Module',
    estimatedMinutes: 8,
    exerciseCount: 9,
  };
}

function lessonProgress(lessonId: string, status: LessonProgress['status'], extra: Partial<LessonProgress> = {}): LessonProgress {
  return {
    lessonId,
    subjectId: 'python',
    moduleId: 'm',
    status,
    correctCount: 0,
    incorrectCount: 0,
    totalExercises: 10,
    nextExerciseIndex: 0,
    ...extra,
  };
}

const lessons = [ref('py-1'), ref('py-2'), ref('ts-1', 'typescript')];

function state(extra: Partial<ProgressState> = {}): ProgressState {
  return { ...emptyProgressState(), ...extra };
}

describe('home recommendation priority', () => {
  test('1 — an unfinished lesson wins over everything else', () => {
    const result = recommendNext({
      lessons,
      progress: state({
        lessons: [lessonProgress('py-2', 'in_progress', { nextExerciseIndex: 4, startedAt: '2026-01-02T10:00:00Z' })],
        lastSubjectId: 'typescript',
      }),
      dueReviewCount: 12,
    });
    assert.equal(result.kind, 'continue_lesson');
    if (result.kind !== 'continue_lesson') return;
    assert.equal(result.lesson.lessonId, 'py-2');
    assert.equal(result.progressPercent, 40);
  });

  test('2 — reviews come next when nothing is half-finished', () => {
    const result = recommendNext({ lessons, progress: state(), dueReviewCount: 5 });
    assert.equal(result.kind, 'review');
    if (result.kind !== 'review') return;
    assert.equal(result.dueCount, 5);
  });

  test('3 — then the next lesson in the subject last studied', () => {
    const result = recommendNext({
      lessons,
      progress: state({ lastSubjectId: 'typescript', lessons: [lessonProgress('py-1', 'completed')] }),
      dueReviewCount: 0,
    });
    assert.equal(result.kind, 'next_lesson');
    if (result.kind !== 'next_lesson') return;
    assert.equal(result.lesson.lessonId, 'ts-1');
  });

  test('4 — otherwise the first available lesson anywhere', () => {
    const result = recommendNext({ lessons, progress: state(), dueReviewCount: 0 });
    assert.equal(result.kind, 'next_lesson');
    if (result.kind !== 'next_lesson') return;
    assert.equal(result.lesson.lessonId, 'py-1');
  });

  test('reports nothing available once every lesson is completed', () => {
    const result = recommendNext({
      lessons,
      progress: state({ lessons: lessons.map((l) => lessonProgress(l.lessonId, 'completed')) }),
      dueReviewCount: 0,
    });
    assert.equal(result.kind, 'nothing_available');
  });

  test('an in-progress lesson that is no longer unlocked is skipped', () => {
    const result = recommendNext({
      lessons: [ref('py-1')],
      progress: state({ lessons: [lessonProgress('removed-lesson', 'in_progress')] }),
      dueReviewCount: 0,
    });
    assert.equal(result.kind, 'next_lesson');
  });
});
