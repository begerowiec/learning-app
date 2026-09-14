import type { ReactNode } from 'react';
import type { Translator } from '@ui/i18n/index.ts';
import { ProgressBar } from './ProgressBar.tsx';

/**
 * The chrome every exercise shares: close button, session label, counter,
 * progress bar, a scrolling body, and a footer that holds feedback plus the
 * main call to action.
 *
 * Every exercise type renders inside this — there is no per-type flow.
 */
export function ExerciseLayout({
  label,
  counter,
  percent,
  onExit,
  children,
  footer,
  t,
}: {
  label: string;
  counter: string;
  percent: number;
  onExit: () => void;
  children: ReactNode;
  footer: ReactNode;
  t: Translator['t'];
}) {
  return (
    <div className="screen">
      <div className="session-header">
        <div className="session-header-row">
          <button className="session-close" onClick={onExit} type="button" aria-label={t('session.leave')} data-testid="session-exit">
            ✕
          </button>
          <span className="session-label text-muted">{label}</span>
          <span className="session-counter" data-testid="session-counter">
            {counter}
          </span>
        </div>
        <div style={{ marginTop: 12 }}>
          <ProgressBar percent={percent} thin label={t('session.progress')} />
        </div>
      </div>

      <div className="app-scroll session-body">{children}</div>

      <div className="session-foot">{footer}</div>
    </div>
  );
}
