import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { emptyProgressState, type ExerciseAttempt, type ProgressState } from '../../src/core/progress/models.ts';
import { localDate, overallStats, streak, subjectStats, weakestTags, weeklyActivity } from '../../src/core/progress/stats.ts';

const now = new Date('2026-03-10T20:00:00');

function attempt(overrides: Partial<ExerciseAttempt> = {}): ExerciseAttempt {
  return {
    exerciseId: 'e1',
    lessonId: 'l1',
    subjectId: 'python',
    tags: ['functions'],
    correct: true,
    answeredAt: now.toISOString(),
    durationSeconds: 20,
    attempts: 1,
    ...overrides,
  };
}

function stateWith(attempts: ExerciseAttempt[], extra: Partial<ProgressState> = {}): ProgressState {
  return { ...emptyProgressState(), attempts, ...extra };
}

describe('overall statistics', () => {
  test('accuracy rounds to whole percent', () => {
    const state = stateWith([
      attempt({ exerciseId: 'a', correct: true }),
      attempt({ exerciseId: 'b', correct: false }),
      attempt({ exerciseId: 'c', correct: true }),
    ]);
    const stats = overallStats(state, now);
    assert.equal(stats.totalQuestions, 3);
    assert.equal(stats.correctAnswers, 2);
    assert.equal(stats.accuracy, 67);
  });

  test('an empty history reports zeros rather than NaN', () => {
    const stats = overallStats(emptyProgressState(), now);
    assert.equal(stats.accuracy, 0);
    assert.equal(stats.streakDays, 0);
  });
});

describe('streak', () => {
  const day = (offset: number) => localDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset));

  test('counts consecutive days up to today', () => {
    assert.equal(streak([day(0), day(1), day(2)], now), 3);
  });

  test('survives an idle today — it breaks only after a full missed day', () => {
    assert.equal(streak([day(1), day(2)], now), 2);
  });

  test('breaks on a gap', () => {
    assert.equal(streak([day(0), day(2), day(3)], now), 1);
  });

  test('is zero with no study days', () => {
    assert.equal(streak([], now), 0);
  });
});

describe('weakest tags', () => {
  test('ranks by accuracy and ignores single-attempt noise', () => {
    const state = stateWith([
      attempt({ exerciseId: '1', tags: ['closures'], correct: false }),
      attempt({ exerciseId: '2', tags: ['closures'], correct: false }),
      attempt({ exerciseId: '3', tags: ['closures'], correct: true }),
      attempt({ exerciseId: '4', tags: ['scope'], correct: false }),
      attempt({ exerciseId: '5', tags: ['scope'], correct: true }),
      attempt({ exerciseId: '6', tags: ['oneoff'], correct: false }),
    ]);
    const weak = weakestTags(state);
    assert.deepEqual(
      weak.map((t) => t.tag),
      ['closures', 'scope'],
    );
    assert.equal(weak[0]?.accuracy, 33);
  });

  test('leaves out tags that are always answered correctly', () => {
    const state = stateWith([
      attempt({ exerciseId: '1', tags: ['solid'], correct: true }),
      attempt({ exerciseId: '2', tags: ['solid'], correct: true }),
    ]);
    assert.deepEqual(weakestTags(state), []);
  });
});

describe('per-subject statistics', () => {
  test('completion is measured against the subject lesson count', () => {
    const state = stateWith([attempt({ subjectId: 'python' })], {
      lessons: [
        { lessonId: 'l1', subjectId: 'python', moduleId: 'm', status: 'completed', correctCount: 8, incorrectCount: 1, totalExercises: 9, nextExerciseIndex: 0 },
        { lessonId: 'l2', subjectId: 'python', moduleId: 'm', status: 'in_progress', correctCount: 2, incorrectCount: 0, totalExercises: 9, nextExerciseIndex: 2 },
      ],
    });
    const [python] = subjectStats(state, { python: 4 });
    assert.equal(python?.completedLessons, 1);
    assert.equal(python?.completionPercent, 25);
  });
});

describe('weekly activity', () => {
  test('returns seven days ending today, oldest first', () => {
    const week = weeklyActivity(emptyProgressState(), now);
    assert.equal(week.length, 7);
    assert.equal(week[6]?.date, localDate(now));
  });

  test('buckets session minutes onto the day they started', () => {
    const state: ProgressState = {
      ...emptyProgressState(),
      sessions: [
        {
          id: 's1',
          kind: 'lesson',
          startedAt: now.toISOString(),
          numberOfExercises: 9,
          correctAnswers: 8,
          incorrectAnswers: 1,
          durationSeconds: 300,
        },
      ],
    };
    const week = weeklyActivity(state, now);
    assert.equal(week[6]?.minutes, 5);
  });
});
