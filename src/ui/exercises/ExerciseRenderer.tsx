import { CodeExercise } from './CodeExercise.tsx';
import { ConceptExercise } from './ConceptExercise.tsx';
import { FillBlankExercise } from './FillBlankExercise.tsx';
import { FlashcardExercise } from './FlashcardExercise.tsx';
import { MultipleChoiceExercise } from './MultipleChoiceExercise.tsx';
import { TranslationExercise } from './TranslationExercise.tsx';
import { TrueFalseExercise } from './TrueFalseExercise.tsx';
import type { ExerciseRendererProps } from './types.ts';

/**
 * The dispatch table.
 *
 * One switch, exhaustive over `Exercise['type']` — add a member to the union
 * and TypeScript fails here until a renderer exists. That is the only place in
 * the app that knows exercise types apart; everything else works with the
 * validated object.
 */
export function ExerciseRenderer(props: ExerciseRendererProps): unknown {
  const { exercise } = props;

  switch (exercise.type) {
    case 'multiple_choice':
      return <MultipleChoiceExercise {...props} exercise={exercise} />;
    case 'concept_question':
      return <ConceptExercise {...props} exercise={exercise} />;
    case 'true_false':
      return <TrueFalseExercise {...props} exercise={exercise} />;
    case 'fill_blank':
      return <FillBlankExercise {...props} exercise={exercise} />;
    case 'translation':
      return <TranslationExercise {...props} exercise={exercise} />;
    case 'flashcard':
      return <FlashcardExercise {...props} exercise={exercise} />;
    case 'code_multiple_choice':
    case 'code_completion':
    case 'find_error':
      return <CodeExercise {...props} exercise={exercise} />;
    default:
      return assertNever(exercise);
  }
}

function assertNever(value: never): never {
  throw new Error(`No renderer registered for exercise type: ${JSON.stringify(value)}`);
}
