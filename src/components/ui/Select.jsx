import { forwardRef } from 'react';
import { cn } from '../../lib/cn';

const Select = forwardRef(({ className, children, ...props }, ref) => {
  return (
    <select
      className={cn(
        'w-full px-3 py-2 text-sm rounded-lg border transition-colors',
        'bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-primary)]',
        'focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)]',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </select>
  );
});

Select.displayName = 'Select';

export default Select;
