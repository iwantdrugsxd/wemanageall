import { cn } from '../../lib/cn';

export default function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded bg-[var(--bg-surface)]',
        className
      )}
      {...props}
    />
  );
}
