import type { Exercise } from '@core/domain/schema.ts';
import { BLANK_MARKER } from '@core/domain/schema.ts';
import { FALSE_OPTION_ID, optionsOf, TRUE_OPTION_ID } from '@core/session/grading.ts';
import type { ReviewNote } from '@core/session/sessionEngine.ts';
import type { Translator, UiKey } from '@ui/i18n/index.ts';
import { answerStateFor } from './answerState.ts';
import { AnswerOption } from '@ui/components/index.ts';

/**
 * The type label is UI copy, not content: it says what kind of question this
 * is, so it follows the interface language even when the lesson is English.
 */
export function typeLabelFor(exercise: Exercise, tr: Translator): string {
  const label = tr.t(`exerciseType.${exercise.type}` as UiKey);
  if (exercise.type === 'translation') {
    return `${label} ${exercise.sourceLanguage.toUpperCase()} → ${exercise.targetLanguage.toUpperCase()}`;
  }
  return label;
}

export function noteText(note: ReviewNote | undefined, tr: Translator): string | undefined {
  if (!note) return undefined;
  switch (note.kind) {
    case 'added':
      return tr.t('review.note.added');
    case 'seenToday':
      return tr.t('review.note.seenToday');
    case 'seenDaysAgo':
      return tr.t('review.note.seenDaysAgo', { count: note.count });
    case 'wrongTimes':
      return tr.t('review.note.wrongTimes', { count: note.count });
  }
}

export function QuestionHead({ exercise, note, tr }: { exercise: Exercise; note?: ReviewNote; tr: Translator }) {
  const text = noteText(note, tr);
  return (
    <div className="question-head">
      <span className="question-type">{typeLabelFor(exercise, tr)}</span>
      {text ? <span className="question-note text-muted">{text}</span> : null}
    </div>
  );
}

export function Prompt({ children }: { children: string }) {
  return (
    <div className="question-prompt" data-testid="question-prompt">
      {children}
    </div>
  );
}

/**
 * True/False is the one exercise whose answers are not content — they are the
 * app's own words — so their labels follow the interface language.
 */
export function optionLabel(exercise: Exercise, optionId: string, text: string, tr: Translator): string {
  if (exercise.type !== 'true_false') return text;
  if (optionId === TRUE_OPTION_ID) return tr.t('answerTrue');
  if (optionId === FALSE_OPTION_ID) return tr.t('answerFalse');
  return text;
}

/** The answer list, shared by every choice-style exercise. */
export function OptionList({
  exercise,
  selectedOptionId,
  checked,
  onSelect,
  tr,
  mono = false,
}: {
  exercise: Exercise;
  selectedOptionId: string | null;
  checked: boolean;
  onSelect: (optionId: string) => void;
  tr: Translator;
  mono?: boolean;
}) {
  const options = optionsOf(exercise);
  return (
    <div className="options" role="group" aria-label={tr.t('session.answers')}>
      {options.map((option, index) => (
        <AnswerOption
          key={option.id}
          id={option.id}
          text={optionLabel(exercise, option.id, option.text, tr)}
          index={index}
          mono={mono}
          locked={checked}
          state={answerStateFor(exercise, option.id, selectedOptionId, checked)}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

/** A sentence with its gap highlighted rather than rendered as bare text. */
export function SentenceWithBlank({ sentence }: { sentence: string }) {
  const parts = sentence.split(BLANK_MARKER);
  return (
    <div className="sentence-box" data-testid="sentence">
      {parts.map((part, index) => (
        <span key={index}>
          {part}
          {index < parts.length - 1 ? <span className="sentence-blank">{BLANK_MARKER}</span> : null}
        </span>
      ))}
    </div>
  );
}
