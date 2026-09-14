import type { FlashcardExercise as FlashcardType } from '@core/domain/schema.ts';
import { Flashcard } from '@ui/components/index.ts';
import type { ExerciseRendererProps } from './types.ts';
import { QuestionHead } from './shared.tsx';

/**
 * The one self-graded type. There are no options: the learner flips the card
 * and then tells the app whether they knew it, which the session engine treats
 * as the answer.
 */
export function FlashcardExercise({ exercise, flipped, onFlip, note, tr }: ExerciseRendererProps<FlashcardType>) {
  return (
    <>
      <QuestionHead exercise={exercise} note={note} tr={tr} />
      {exercise.question ? <div className="question-prompt">{exercise.question}</div> : null}
      <Flashcard
        front={exercise.front}
        back={exercise.back}
        flipped={flipped}
        hint={flipped ? exercise.explanation : (exercise.hint ?? tr.t('flashcard.tapToReveal'))}
        onFlip={onFlip}
        t={tr.t}
      />
    </>
  );
}
