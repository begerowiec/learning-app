import type { Translator } from '@ui/i18n/index.ts';
import { BlueprintCorners } from './Blueprint.tsx';

/**
 * A self-graded card. Tapping flips it; the learner then says whether they
 * knew it, which is the only place in the app where grading is not automatic.
 */
export function Flashcard({
  front,
  back,
  flipped,
  hint,
  onFlip,
  t,
}: {
  front: string;
  back: string;
  flipped: boolean;
  hint: string;
  onFlip: () => void;
  t: Translator['t'];
}) {
  return (
    <button
      type="button"
      className={`surface blueprint flashcard${flipped ? ' is-flipped' : ''}`}
      onClick={onFlip}
      data-testid="flashcard"
      aria-live="polite"
    >
      <BlueprintCorners />
      <span className="flashcard-side text-muted">{flipped ? t('flashcard.back') : t('flashcard.front')}</span>
      <span className="flashcard-text">{flipped ? back : front}</span>
      <span className="flashcard-hint text-muted">{hint}</span>
    </button>
  );
}
