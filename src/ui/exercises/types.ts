import type { Exercise } from '@core/domain/schema.ts';
import type { ReviewNote } from '@core/session/sessionEngine.ts';
import type { Translator } from '@ui/i18n/index.ts';

/**
 * The contract every exercise renderer implements.
 *
 * Renderers are presentational: they draw the question body and report taps.
 * Grading, progress and scheduling all happen in core, which is why adding a
 * tenth exercise type means adding a schema and a renderer — and touching
 * nothing else.
 */
export interface ExerciseRendererProps<E extends Exercise = Exercise> {
  exercise: E;
  /** The option tapped so far, if any. */
  selectedOptionId: string | null;
  /** True once the answer has been submitted; selections are then frozen. */
  checked: boolean;
  /** Flashcards only. */
  flipped: boolean;
  onSelect: (optionId: string) => void;
  onFlip: () => void;
  /** Context shown in review sessions; the renderer translates it. */
  note?: ReviewNote;
  /** Interface-language translator — type labels and True/False are UI copy. */
  tr: Translator;
}
