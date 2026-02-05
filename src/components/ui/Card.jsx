import { cn } from '../../lib/cn';

export function Card({ children, className, ...props }) {
  return (
    <div
      className={cn(
        'rounded-lg border transition-colors',
        'bg-[var(--bg-card)] border-[var(--border-subtle)]',
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
