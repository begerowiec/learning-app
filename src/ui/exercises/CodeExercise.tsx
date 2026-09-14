import type {
  CodeCompletionExercise,
  CodeMultipleChoiceExercise,
  FindErrorExercise,
} from '@core/domain/schema.ts';
import { CodeBlock } from '@ui/components/index.ts';
import type { ExerciseRendererProps } from './types.ts';
import { OptionList, Prompt, QuestionHead } from './shared.tsx';

type CodeExerciseType = CodeMultipleChoiceExercise | CodeCompletionExercise | FindErrorExercise;

/**
 * All three code-bearing types share one renderer: read the snippet, pick the
 * answer. The differences (a gap to fill, a line to blame) live in the content
 * itself, not in the component — which is why "find the error" needs no
 * special UI, just numbered lines in the code.
 *
 * Answers are rendered in monospace, because for these questions the options
 * are code too.
 */
export function CodeExercise({
  exercise,
  selectedOptionId,
  checked,
  onSelect,
  note,
  tr,
}: ExerciseRendererProps<CodeExerciseType>) {
  return (
    <>
      <QuestionHead exercise={exercise} note={note} tr={tr} />
      <Prompt>{exercise.question}</Prompt>
      <CodeBlock code={exercise.code} language={exercise.language} framed />
      <OptionList
        exercise={exercise}
        selectedOptionId={selectedOptionId}
        checked={checked}
        onSelect={onSelect}
        tr={tr}
        mono={exercise.type !== 'find_error'}
      />
    </>
  );
}
