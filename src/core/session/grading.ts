/**
 * One grading model for every exercise type.
 *
 * Eight of the nine types are answered by picking one option; a flashcard is
 * graded by the learner. Rather than letting each renderer invent its own
 * answer shape, every choice-style exercise is normalised to the same
 * `{ options, correctOptionId }` pair here — including `true_false`, whose
 * boolean is projected onto two synthetic options.
 *
 * That is what keeps `ExerciseRenderer` a dispatch table instead of a fork in
 * the session flow: the engine only ever deals in option ids.
 */
import type { Answer, Exercise } from '../domain/schema.ts';

export const TRUE_OPTION_ID = 'true';
export const FALSE_OPTION_ID = 'false';

/**
 * The two synthetic options a true/false exercise is projected onto. The text
 * here is a neutral default; the UI replaces it with a translated label, since
 * "True" is the one answer in the app that is not part of the content.
 */
const BOOLEAN_OPTIONS: Answer[] = [
  { id: TRUE_OPTION_ID, text: 'True' },
  { id: FALSE_OPTION_ID, text: 'False' },
];

/** The options to render, or `[]` for self-graded exercises. */
export function optionsOf(exercise: Exercise): Answer[] {
  if (exercise.type === 'true_false') return BOOLEAN_OPTIONS;
  if (exercise.type === 'flashcard') return [];
  return exercise.answers;
}

export function correctOptionId(exercise: Exercise): string | null {
  if (exercise.type === 'true_false') return exercise.correctAnswer ? TRUE_OPTION_ID : FALSE_OPTION_ID;
  if (exercise.type === 'flashcard') return null;
  return exercise.correctAnswer;
}

export function correctAnswerText(exercise: Exercise): string | null {
  const id = correctOptionId(exercise);
  if (id === null) return null;
  return optionsOf(exercise).find((option) => option.id === id)?.text ?? null;
}

export function isSelfGraded(exercise: Exercise): boolean {
  return exercise.type === 'flashcard';
}

/** The learner's response — a picked option, or their own verdict on a card. */
export type Response = { kind: 'option'; optionId: string } | { kind: 'self'; remembered: boolean };

export function grade(exercise: Exercise, response: Response): boolean {
  if (response.kind === 'self') return response.remembered;
  return response.optionId === correctOptionId(exercise);
}

/** Label shown above the question, e.g. "Code question". */
export const EXERCISE_TYPE_LABELS: Record<Exercise['type'], string> = {
  multiple_choice: 'Multiple choice',
  true_false: 'True / False',
  fill_blank: 'Fill in the blank',
  translation: 'Translation',
  flashcard: 'Flashcard',
  code_multiple_choice: 'Code question',
  code_completion: 'Code completion',
  find_error: 'Find the error',
  concept_question: 'Concept question',
};

export function typeLabel(exercise: Exercise): string {
  if (exercise.type === 'translation' && exercise.sourceLanguage && exercise.targetLanguage) {
    return `Translation ${exercise.sourceLanguage.toUpperCase()} → ${exercise.targetLanguage.toUpperCase()}`;
  }
  return EXERCISE_TYPE_LABELS[exercise.type];
}

/** Summary label for an exercise — used in results lists and review rows. */
export function exerciseTopic(exercise: Exercise): string {
  return exercise.topic ?? EXERCISE_TYPE_LABELS[exercise.type];
}
