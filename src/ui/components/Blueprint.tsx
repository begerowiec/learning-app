import type { ReactNode } from 'react';

/**
 * The wireframe frame from the design: a hairline box with registration marks
 * at the corners. Used for the device shell, primary CTAs and the two
 * highlighted cards (Continue learning, session summary).
 */
export function Blueprint({
  as: Tag = 'div',
  className = '',
  children,
  ...rest
}: {
  as?: 'div' | 'section';
  className?: string;
  children?: ReactNode;
  style?: Record<string, string | number | undefined>;
}) {
  return (
    <Tag className={`blueprint ${className}`.trim()} {...rest}>
      <i className="corner tl" />
      <i className="corner tr" />
      <i className="corner bl" />
      <i className="corner br" />
      {children}
    </Tag>
  );
}

/** The four corner marks on their own, for elements that are already boxes. */
export function BlueprintCorners() {
  return (
    <>
      <i className="corner tl" />
      <i className="corner tr" />
      <i className="corner bl" />
      <i className="corner br" />
    </>
  );
}
