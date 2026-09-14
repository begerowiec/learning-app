import type { ReactNode } from 'react';
import { BlueprintCorners } from './Blueprint.tsx';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: ButtonVariant;
  /** Full-width, 48px tall — the standing CTA at the bottom of a screen. */
  block?: boolean;
  size?: 'md' | 'sm' | 'micro';
  disabled?: boolean;
  /** Draws the registration marks; reserved for the primary action on a screen. */
  framed?: boolean;
  type?: 'button' | 'submit';
  'data-testid'?: string;
  'aria-label'?: string;
}

export function Button({
  children,
  onClick,
  variant = 'secondary',
  block = false,
  size = 'md',
  disabled = false,
  framed = false,
  type = 'button',
  ...rest
}: ButtonProps) {
  const classes = [
    'btn',
    `btn-${variant}`,
    block ? 'btn-block' : '',
    size === 'md' && block ? 'cta' : '',
    size === 'sm' ? 'cta-sm' : '',
    size === 'micro' ? 'btn-micro' : '',
    framed ? 'blueprint' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} onClick={onClick} disabled={disabled} type={type} {...rest}>
      {framed ? <BlueprintCorners /> : null}
      {children}
    </button>
  );
}
