import type { SubjectView } from '@core/LearningService.ts';
import type { Translator } from '@ui/i18n/index.ts';
import { ProgressBar } from './ProgressBar.tsx';
import { Tag } from './Tag.tsx';

/** Compact row used on Home. */
export function SubjectRow({ view, lastLine, onOpen }: { view: SubjectView; lastLine: string; onOpen: () => void }) {
  return (
    <button type="button" className="surface subject-row" onClick={onOpen} data-testid={`subject-row-${view.subject.id}`}>
      <span className="glyph-tile is-md" aria-hidden="true">
        {view.subject.glyph}
      </span>
      <span className="subject-row-body">
        <span className="subject-row-head">
          <span className="subject-row-name">{view.subject.name}</span>
          <span className="subject-row-level text-muted">{view.levelName}</span>
          <span className="subject-row-pct">{view.percent}%</span>
        </span>
        <ProgressBar percent={view.percent} thin label={`${view.subject.name} progress`} />
        <span className="subject-row-last text-muted">{lastLine}</span>
      </span>
    </button>
  );
}

/** Larger card used on the Learn tab. */
export function SubjectCard({ view, onOpen, tr }: { view: SubjectView; onOpen: () => void; tr: Translator }) {
  const moduleLine = `${tr.tc('unit.module', view.modules.length)} · ${tr.tc('unit.lesson', view.lessonCount)}`;

  return (
    <button type="button" className="surface subject-card" onClick={onOpen} data-testid={`subject-card-${view.subject.id}`}>
      <span className="subject-card-head">
        <span className="glyph-tile is-md" aria-hidden="true">
          {view.subject.glyph}
        </span>
        <span className="subject-card-name">{view.subject.name}</span>
        <Tag tone="accent" style={{ marginLeft: 'auto' }}>
          {view.levelName}
        </Tag>
      </span>
      <span className="text-muted" style={{ fontSize: 12 }}>
        {moduleLine}
      </span>
      <ProgressBar percent={view.percent} thin label={`${view.subject.name} progress`} />
    </button>
  );
}
