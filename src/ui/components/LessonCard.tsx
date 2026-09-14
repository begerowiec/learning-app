import type { LessonView, ModuleView } from '@core/LearningService.ts';
import type { Translator } from '@ui/i18n/index.ts';
import { ProgressBar } from './ProgressBar.tsx';
import { Tag } from './Tag.tsx';

const STATUS_KEYS = {
  not_started: 'status.not_started',
  'in progress': 'status.in progress',
  completed: 'status.completed',
} as const;

export function ModuleCard({ view, onOpen, tr }: { view: ModuleView; onOpen: () => void; tr: Translator }) {
  const meta =
    `${tr.tc('unit.lesson', view.lessons.length)} · ` +
    (view.percent > 0 ? tr.t('module.donePercent', { percent: view.percent }) : tr.t('module.notStartedYet'));

  return (
    <button
      type="button"
      className={`surface module-card${view.percent === 0 ? ' is-locked' : ''}`}
      onClick={onOpen}
      data-testid={`module-card-${view.module.id}`}
    >
      <span className="module-card-head">
        <span className="module-card-name">{view.module.title}</span>
        <Tag tone={view.percent > 0 ? 'accent' : 'neutral'} style={{ marginLeft: 'auto' }}>
          {tr.t(STATUS_KEYS[view.status])}
        </Tag>
      </span>
      <span className="module-card-meta text-muted">{meta}</span>
      <ProgressBar percent={view.percent} thin label={`${view.module.title} progress`} />
    </button>
  );
}

export function LessonCard({
  view,
  index,
  onOpen,
  tr,
}: {
  view: LessonView;
  index: number;
  onOpen: () => void;
  tr: Translator;
}) {
  const markClass =
    view.status === 'completed' ? 'lesson-mark is-done' : view.status === 'in_progress' ? 'lesson-mark is-active' : 'lesson-mark';

  const meta =
    view.status === 'completed'
      ? tr.t('lesson.completedPct', { percent: accuracy(view) })
      : view.status === 'in_progress'
        ? tr.t('lesson.inProgressPct', { percent: view.percent })
        : `${tr.tc('unit.question', view.lesson.exercises.length)} · ${tr.t('home.minutesShort', { count: view.lesson.estimatedMinutes })}`;

  return (
    <button type="button" className="surface lesson-row" onClick={onOpen} data-testid={`lesson-row-${view.lesson.id}`}>
      <span className={markClass} aria-hidden="true">
        {view.status === 'completed' ? '✓' : index + 1}
      </span>
      <span className="lesson-row-body">
        <span className="lesson-row-name">
          {view.lesson.title}
          {view.localized ? null : (
            <Tag tone="neutral" style={{ marginLeft: 8, verticalAlign: 'middle' }}>
              {tr.t('app.englishFallback')}
            </Tag>
          )}
        </span>
        <span className="lesson-row-meta text-muted">{meta}</span>
      </span>
      <span className="text-muted" style={{ fontSize: 15 }} aria-hidden="true">
        →
      </span>
    </button>
  );
}

function accuracy(view: LessonView): number {
  const total = view.correctCount + view.incorrectCount;
  return total === 0 ? 100 : Math.round((view.correctCount / total) * 100);
}
