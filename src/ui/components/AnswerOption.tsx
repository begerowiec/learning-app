import type { AnswerState } from '@core/session/sessionEngine.ts';

const MARKS: Record<AnswerState, string | null> = {
  unanswered: null,
  selected: '•',
  correct: '✓',
  incorrect: '✕',
  completed: null,
};

/**
 * One tappable answer. The five UI states from the spec map straight onto
 * `data-state`, so the visual treatment lives in CSS and this component stays
 * a thin, testable shell.
 */
export function AnswerOption({
  id,
  text,
  index,
  state,
  onSelect,
  locked,
  mono = false,
}: {
  id: string;
  text: string;
  index: number;
  state: AnswerState;
  onSelect: (optionId: string) => void;
  locked: boolean;
  mono?: boolean;
}) {
  const letter = String.fromCharCode(65 + index);
  return (
    <button
      type="button"
      className={`surface option${mono ? ' is-mono' : ''}`}
      data-state={state}
      data-testid={`option-${id}`}
      aria-pressed={state === 'selected' || state === 'correct'}
      aria-disabled={locked}
      onClick={() => {
        if (!locked) onSelect(id);
      }}
    >
      <span className="option-mark" aria-hidden="true">
        {MARKS[state] ?? letter}
      </span>
      <span className="option-text">{text}</span>
    </button>
  );
}
