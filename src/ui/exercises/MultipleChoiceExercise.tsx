import type { MultipleChoiceExercise as MultipleChoice } from '@core/domain/schema.ts';
import type { ExerciseRendererProps } from './types.ts';
import { OptionList, Prompt, QuestionHead } from './shared.tsx';

export function MultipleChoiceExercise({
  exercise,
  selectedOptionId,
  checked,
  onSelect,
  note,
  tr,
}: ExerciseRendererProps<MultipleChoice>) {
  return (
    <>
      <QuestionHead exercise={exercise} note={note} tr={tr} />
      <Prompt>{exercise.question}</Prompt>
      <OptionList exercise={exercise} selectedOptionId={selectedOptionId} checked={checked} onSelect={onSelect} tr={tr} />
    </>
  );
}
