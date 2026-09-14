import type { Translator } from '@ui/i18n/index.ts';

export function FeedbackPanel({
  correct,
  explanation,
  correctAnswer,
  t,
}: {
  correct: boolean;
  explanation: string;
  /** Shown only when the learner got it wrong. */
  correctAnswer?: string | null;
  t: Translator['t'];
}) {
  return (
    <div className="feedback-wrap">
      <div className={`feedback${correct ? ' is-correct' : ''}`} role="status" data-testid="feedback">
        <div className="feedback-head">
          <span className="feedback-glyph" aria-hidden="true">
            {correct ? '✓' : '✕'}
          </span>
          <span className="feedback-title">{correct ? t('feedback.correct') : t('feedback.notQuite')}</span>
        </div>
        {!correct && correctAnswer ? (
          <div className="feedback-answer">
            <span className="text-muted">{t('feedback.correctAnswer')}</span>
            <strong>{correctAnswer}</strong>
          </div>
        ) : null}
        <p>{explanation}</p>
      </div>
    </div>
  );
}
