import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import type { Exercise } from '../../src/core/domain/schema.ts';
import { ProgressService } from '../../src/core/progress/ProgressService.ts';
import { MemoryProgressStore } from '../../src/core/progress/ProgressStore.ts';
import { SimpleSpacedRepetition } from '../../src/core/review/ReviewScheduler.ts';
import { startSession } from '../../src/core/session/sessionEngine.ts';

const exercise = (id: string): Exercise =>
  ({
    id,
    type: 'multiple_choice',
    question: 'Q?',
    answers: [
      { id: 'a', text: 'one' },
      { id: 'b', text: 'two' },
    ],
    correctAnswer: 'a',
    explanation: 'because',
    tags: ['functions'],
    difficulty: 2,
    estimatedSeconds: 30,
  }) as unknown as Exercise;

function makeService(now = new Date('2026-05-01T09:00:00Z')) {
  const store = new MemoryProgressStore();
  return {
    store,
    service: new ProgressService(store, new SimpleSpacedRepetition(), () => now),
    now,
  };
}

const attemptInput = (id: string, correct: boolean) => ({
  exercise: exercise(id),
  lessonId: 'python-functions',
  subjectId: 'python',
  correct,
  durationSeconds: 12,
});

describe('review queue maintenance', () => {
  test('a wrong answer puts the exercise into the queue', () => {
    const { service } = makeService();
    const state = service.recordAttempt(attemptInput('e1', false));
    assert.equal(state.reviewQueue.length, 1);
    assert.equal(state.reviewQueue[0]?.exerciseId, 'e1');
    assert.equal(state.reviewQueue[0]?.lapses, 1);
  });

  test('a correct answer on an exercise never missed does not create work', () => {
    const { service } = makeService();
    const state = service.recordAttempt(attemptInput('e1', true));
    assert.equal(state.reviewQueue.length, 0);
  });

  test('answering a queued item correctly moves it up the ladder', () => {
    const { service } = makeService();
    service.recordAttempt(attemptInput('e1', false));
    const state = service.recordAttempt(attemptInput('e1', true));
    assert.equal(state.reviewQueue.length, 1);
    assert.equal(state.reviewQueue[0]?.reviewStage, 1);
    assert.equal(state.reviewQueue[0]?.lapses, 1);
  });

  test('a second lapse resets the stage and increments the lapse count', () => {
    const { service } = makeService();
    service.recordAttempt(attemptInput('e1', false));
    service.recordAttempt(attemptInput('e1', true));
    const state = service.recordAttempt(attemptInput('e1', false));
    assert.equal(state.reviewQueue[0]?.reviewStage, 0);
    assert.equal(state.reviewQueue[0]?.lapses, 2);
  });
});

describe('attempts and lesson progress', () => {
  test('attempts are numbered per exercise', () => {
    const { service } = makeService();
    service.recordAttempt(attemptInput('e1', false));
    const state = service.recordAttempt(attemptInput('e1', true));
    assert.deepEqual(
      state.attempts.map((a) => a.attempts),
      [1, 2],
    );
  });

  test('a lesson goes not_started → in_progress → completed', () => {
    const { service } = makeService();
    const start = service.startLesson({
      lessonId: 'python-functions',
      subjectId: 'python',
      moduleId: 'python-core',
      level: 'intermediate',
      totalExercises: 9,
    });
    assert.equal(start.lessons[0]?.status, 'in_progress');

    service.recordAttempt(attemptInput('e1', true));
    service.recordAttempt(attemptInput('e2', false));
    const done = service.completeLesson('python-functions', 240);

    assert.equal(done.lessons[0]?.status, 'completed');
    assert.equal(done.lessons[0]?.correctCount, 1);
    assert.equal(done.lessons[0]?.incorrectCount, 1);
    assert.ok(done.lessons[0]?.completedAt);
  });

  test('the day of the attempt is recorded once, for the streak', () => {
    const { service } = makeService();
    service.recordAttempt(attemptInput('e1', true));
    const state = service.recordAttempt(attemptInput('e2', true));
    assert.equal(state.studyDays.length, 1);
  });

  test('finishing a session stores a StudySession', () => {
    const { service } = makeService();
    const state = service.finishSession({
      id: 's1',
      kind: 'lesson',
      subjectId: 'python',
      lessonId: 'python-functions',
      startedAt: Date.parse('2026-05-01T09:00:00Z'),
      results: [
        { exerciseId: 'e1', topic: 'T', tags: ['functions'], correct: true, durationSeconds: 10 },
        { exerciseId: 'e2', topic: 'T', tags: ['functions'], correct: false, durationSeconds: 15 },
      ],
      durationSeconds: 25,
    });
    assert.equal(state.sessions.length, 1);
    assert.equal(state.sessions[0]?.correctAnswers, 1);
    assert.equal(state.sessions[0]?.incorrectAnswers, 1);
  });
});

describe('offline session persistence', () => {
  test('an in-flight session survives a reload', () => {
    const { store, service } = makeService();
    const session = startSession({
      id: 's1',
      kind: 'lesson',
      label: 'Python · Functions',
      items: [
        { exercise: exercise('e1'), lessonId: 'python-functions', subjectId: 'python' },
        { exercise: exercise('e2'), lessonId: 'python-functions', subjectId: 'python' },
      ],
      lessonId: 'python-functions',
      subjectId: 'python',
    });
    service.saveActiveSession({ ...session, index: 1, results: [{ exerciseId: 'e1', topic: 'T', tags: ['functions'], correct: true, durationSeconds: 9 }] });

    const revived = new ProgressService(store);
    const active = revived.getState().activeSession;
    assert.equal(active?.index, 1);
    assert.deepEqual(active?.exerciseIds, ['e1', 'e2']);
    assert.equal(active?.results.length, 1);
  });

  test('finishing clears the active session', () => {
    const { service } = makeService();
    const session = startSession({
      id: 's1',
      kind: 'review',
      label: 'Review session',
      items: [{ exercise: exercise('e1'), lessonId: 'l', subjectId: 'python' }],
    });
    service.saveActiveSession(session);
    const state = service.finishSession({
      id: 's1',
      kind: 'review',
      startedAt: Date.now(),
      results: [],
      durationSeconds: 5,
    });
    assert.equal(state.activeSession, undefined);
  });
});

describe('preferences', () => {
  test('are persisted separately from progress and survive a reset', () => {
    const { store, service } = makeService();
    service.updatePreferences({ subjects: ['python'], dailyGoalMinutes: 15, onboarded: true });
    service.recordAttempt(attemptInput('e1', false));

    const state = service.resetProgress();
    assert.equal(state.attempts.length, 0);
    assert.equal(new ProgressService(store).getPreferences().dailyGoalMinutes, 15);
    assert.equal(new ProgressService(store).getPreferences().onboarded, true);
  });

  test('a per-subject level is stored independently', () => {
    const { service } = makeService();
    service.setSubjectLevel('python', 'beginner');
    service.setSubjectLevel('english', 'intermediate');
    assert.deepEqual(service.getPreferences().subjectLevels, { python: 'beginner', english: 'intermediate' });
  });
});
