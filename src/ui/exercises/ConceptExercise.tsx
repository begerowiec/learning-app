import type { ConceptQuestionExercise } from '@core/domain/schema.ts';
import type { ExerciseRendererProps } from './types.ts';
import { OptionList, Prompt, QuestionHead } from './shared.tsx';

/**
 * Understanding questions — the "why", not the "what". Visually identical to
 * multiple choice today, but kept separate because it is a distinct content
 * type with its own tags and difficulty curve, and because it is the natural
 * place to add an open-ended, LLM-graded variant later.
 */
export function ConceptExercise({
  exercise,
  selectedOptionId,
  checked,
  onSelect,
  note,
  tr,
}: ExerciseRendererProps<ConceptQuestionExercise>) {
  return (
    <>
      <QuestionHead exercise={exercise} note={note} tr={tr} />
      <Prompt>{exercise.question}</Prompt>
      <OptionList exercise={exercise} selectedOptionId={selectedOptionId} checked={checked} onSelect={onSelect} tr={tr} />
    </>
  );
}
