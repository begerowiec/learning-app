import type { ReactNode } from 'react';

/** Title block for a tab screen: heading plus one line of context. */
export function ScreenHeader({ title, subtitle, aside }: { title: string; subtitle?: string; aside?: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <div style={{ flex: 1 }}>
        <h3 className="screen-title">{title}</h3>
        {subtitle ? <p className="screen-subtitle text-muted" style={{ margin: 0 }}>{subtitle}</p> : null}
      </div>
      {aside}
    </div>
  );
}

/** Back link used at the top of every drill-down screen. */
export function BackLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button className="btn btn-ghost" style={{ fontSize: 12, paddingLeft: 0 }} onClick={onClick} type="button">
      ← {label}
    </button>
  );
}
