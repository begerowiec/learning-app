import type { Exercise } from '@core/domain/schema.ts';
import { correctOptionId } from '@core/session/grading.ts';
import type { AnswerState } from '@core/session/sessionEngine.ts';

/**
 * The visual state of one option.
 *
 * Kept next to the renderers (rather than inside the session engine) because
 * it is purely about presentation: the engine's job is to know what was
 * answered, this function's job is to decide what the learner sees.
 */
export function answerStateFor(
  exercise: Exercise,
  optionId: string,
  selectedOptionId: string | null,
  checked: boolean,
): AnswerState {
  if (!checked) return selectedOptionId === optionId ? 'selected' : 'unanswered';
  if (optionId === correctOptionId(exercise)) return 'correct';
  return selectedOptionId === optionId ? 'incorrect' : 'unanswered';
}
