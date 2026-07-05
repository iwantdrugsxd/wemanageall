import { cn } from '../../lib/cn';

/**
 * Card - the base surface used throughout the app. Rounded generously
 * and lifted with a soft shadow instead of a hard border-only look,
 * so the interface reads as a stack of calm paper sheets rather than
 * a grid of boxed enterprise-software panels.
 */
export function Card({ children, className, interactive = false, ...props }) {
  return (
    <div
      className={cn(
        'rounded-2xl border transition-all duration-200',
        'bg-[var(--bg-card)] border-[var(--border-subtle)]',
        interactive && 'hover:shadow-calm-md hover:border-[var(--border-mid)] cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }) {
  return (
    <div
      className={cn('px-6 py-4 border-b border-[var(--border-subtle)]', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardBody({ children, className, ...props }) {
  return (
    <div
      className={cn('px-6 py-4', className)}
      {...props}
    >
      {children}
    </div>
  );
}
