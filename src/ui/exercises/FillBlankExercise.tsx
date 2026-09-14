import type { FillBlankExercise as FillBlank } from '@core/domain/schema.ts';
import type { ExerciseRendererProps } from './types.ts';
import { OptionList, Prompt, QuestionHead, SentenceWithBlank } from './shared.tsx';

export function FillBlankExercise({
  exercise,
  selectedOptionId,
  checked,
  onSelect,
  note,
  tr,
}: ExerciseRendererProps<FillBlank>) {
  return (
    <>
      <QuestionHead exercise={exercise} note={note} tr={tr} />
      <Prompt>{exercise.question}</Prompt>
      <SentenceWithBlank sentence={exercise.sentence} />
      <OptionList exercise={exercise} selectedOptionId={selectedOptionId} checked={checked} onSelect={onSelect} tr={tr} />
    </>
  );
}
