import type { TrueFalseExercise as TrueFalse } from '@core/domain/schema.ts';
import type { ExerciseRendererProps } from './types.ts';
import { OptionList, Prompt, QuestionHead } from './shared.tsx';

/**
 * The statement is the prompt; the two options are synthesised from the
 * boolean by `optionsOf`, so this renderer needs no special casing.
 */
export function TrueFalseExercise({
  exercise,
  selectedOptionId,
  checked,
  onSelect,
  note,
  tr,
}: ExerciseRendererProps<TrueFalse>) {
  return (
    <>
      <QuestionHead exercise={exercise} note={note} tr={tr} />
      <Prompt>{exercise.question}</Prompt>
      <OptionList exercise={exercise} selectedOptionId={selectedOptionId} checked={checked} onSelect={onSelect} tr={tr} />
    </>
  );
}
