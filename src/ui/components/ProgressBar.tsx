export interface ProgressBarProps {
  /** 0–100. Values outside the range are clamped. */
  percent: number;
  thin?: boolean;
  label?: string;
}

export function ProgressBar({ percent, thin = false, label }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  return (
    <div
      className={`progress-track${thin ? ' is-thin' : ''}`}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? 'Progress'}
    >
      <div className="progress-fill" style={{ width: `${clamped}%` }} />
    </div>
  );
}
