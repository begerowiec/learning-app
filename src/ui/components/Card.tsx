import type { ReactNode } from 'react';

/** Neutral hairline container — the default surface for grouped content. */
export function Card({
  children,
  className = '',
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div className={className} style={{ border: '1px solid var(--color-divider)', padding: padded ? 14 : 0 }}>
      {children}
    </div>
  );
}
