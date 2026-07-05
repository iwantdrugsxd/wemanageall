import { forwardRef } from 'react';
import { cn } from '../../lib/cn';

const Select = forwardRef(({ className, children, ...props }, ref) => {
  return (
    <select
      className={cn(
        'w-full px-3.5 py-2.5 text-sm rounded-xl border transition-all duration-150',
        'bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-primary)]',
        'focus:outline-none focus:border-[var(--accent)] focus:shadow-focus-ring',
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
