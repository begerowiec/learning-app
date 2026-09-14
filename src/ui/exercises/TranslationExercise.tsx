import type { TranslationExercise as Translation } from '@core/domain/schema.ts';
import type { ExerciseRendererProps } from './types.ts';
import { OptionList, Prompt, QuestionHead } from './shared.tsx';

/**
 * The source sentence is rendered in its own box and tagged with a language,
 * which is also where an audio button will sit once listening exercises land —
 * the schema already carries `audio` on both the exercise and each answer.
 */
export function TranslationExercise({
  exercise,
  selectedOptionId,
  checked,
  onSelect,
  note,
  tr,
}: ExerciseRendererProps<Translation>) {
  return (
    <>
      <QuestionHead exercise={exercise} note={note} tr={tr} />
      <Prompt>{exercise.question}</Prompt>
      <div className="sentence-box" lang={exercise.sourceLanguage} data-testid="sentence">
        {exercise.sentence}
      </div>
      <OptionList exercise={exercise} selectedOptionId={selectedOptionId} checked={checked} onSelect={onSelect} tr={tr} />
    </>
  );
}
