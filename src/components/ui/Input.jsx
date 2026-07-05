import { forwardRef } from 'react';
import { cn } from '../../lib/cn';

const Input = forwardRef(({ className, type = 'text', ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'w-full px-3.5 py-2.5 text-sm rounded-xl border transition-all duration-150',
        'bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-primary)]',
        'placeholder:text-[var(--text-muted)]',
        'focus:outline-none focus:border-[var(--accent)] focus:shadow-focus-ring',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = 'Input';

export default Input;
