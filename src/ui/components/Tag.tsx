import type { ReactNode } from 'react';

export type TagTone = 'accent' | 'accent-2' | 'neutral' | 'outline';

export function Tag({ children, tone = 'neutral', style }: { children: ReactNode; tone?: TagTone; style?: Record<string, string | number> }) {
  return (
    <span className={`tag tag-${tone}`} style={style}>
      {children}
    </span>
  );
}
