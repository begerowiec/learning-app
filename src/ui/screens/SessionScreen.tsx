import { correctAnswerText, isSelfGraded } from '@core/session/grading.ts';
import { canCheck, currentItem, isLastItem, progressPercent } from '@core/session/sessionEngine.ts';
import { Button, ExerciseLayout, FeedbackPanel } from '@ui/components/index.ts';
import { ExerciseRenderer } from '@ui/exercises/ExerciseRenderer.tsx';
import { optionLabel } from '@ui/exercises/shared.tsx';
import { correctOptionId } from '@core/session/grading.ts';
import type { AppController } from '@ui/app/useAppController.ts';
import { LoadingScreen } from './LearnScreens.tsx';

/**
 * One screen for every exercise type.
 *
 * The chrome (progress, counter, feedback, CTA) is fixed; the middle is
 * whatever `ExerciseRenderer` dispatches to. Adding an exercise type does not
 * touch this file.
 */
export function SessionScreen({ app }: { app: AppController }) {
  const session = app.session;
  if (!session) return <LoadingScreen app={app} />;

  const item = currentItem(session);
  if (!item) return <LoadingScreen app={app} />;

  const { exercise } = item;
  const selfGraded = isSelfGraded(exercise);
  const showFeedback = session.checked && !selfGraded;
  const showFlashcardActions = selfGraded && session.flipped;
  const correct = session.results[session.results.length - 1]?.correct ?? false;

  const ctaLabel = selfGraded
    ? app.t('session.showAnswer')
    : session.checked
      ? isLastItem(session)
        ? app.t('session.finish')
        : app.t('session.continue')
      : app.t('session.check');

  /* The review label is the app's own words; a lesson label comes from content. */
  const label = session.kind === 'review' ? app.t('home.reviewSession') : session.label;

  const answerText = correctAnswerText(exercise);
  const correctId = correctOptionId(exercise);
  const localizedAnswer = answerText && correctId ? optionLabel(exercise, correctId, answerText, app) : answerText;

  return (
    <ExerciseLayout
      label={label}
      counter={`${session.index + 1} / ${session.items.length}`}
      percent={progressPercent(session)}
      onExit={app.exitSession}
      t={app.t}
      footer={
        <>
          {showFeedback ? (
            <FeedbackPanel correct={correct} explanation={exercise.explanation} correctAnswer={localizedAnswer} t={app.t} />
          ) : null}

          <div className="session-foot-inner">
            {showFlashcardActions ? (
              <div className="flashcard-actions">
                <Button variant="secondary" size="sm" onClick={() => app.answerFlashcard(false)} data-testid="flashcard-again">
                  {app.t('session.again')}
                </Button>
                <Button variant="primary" size="sm" onClick={() => app.answerFlashcard(true)} data-testid="flashcard-got-it">
                  {app.t('session.gotIt')}
                </Button>
              </div>
            ) : (
              <Button
                variant="primary"
                block
                onClick={app.submit}
                disabled={!session.checked && !canCheck(session)}
                data-testid="session-cta"
              >
                {ctaLabel}
              </Button>
            )}
          </div>
        </>
      }
    >
      <ExerciseRenderer
        exercise={exercise}
        selectedOptionId={session.selectedOptionId}
        checked={session.checked}
        flipped={session.flipped}
        onSelect={app.selectOption}
        onFlip={app.flipCard}
        note={item.note}
        tr={app}
      />
    </ExerciseLayout>
  );
}
