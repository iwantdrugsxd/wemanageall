import { forwardRef } from 'react';
import { cn } from '../../lib/cn';

/**
 * Button
 * - `primary` is reserved for the single most important action on a
 *   screen. Using the accent color sparingly keeps it meaningful: when
 *   everything is a colored button, nothing reads as "the next step".
 * - Motion is a subtle scale-down on press (physical, tactile) rather
 *   than a lift/translate on hover, which stays calmer in dense lists.
 */
const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  loading,
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 active:scale-[0.97] focus:outline-none focus-visible:shadow-focus-ring disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] shadow-calm-sm hover:shadow-calm-md',
    secondary: 'bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-mid)] hover:bg-[var(--bg-surface)] hover:border-[var(--border-strong)]',
    ghost: 'bg-transparent text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]',
    growth: 'bg-[var(--growth-soft)] text-[var(--growth)] hover:opacity-90',
    danger: 'bg-[var(--error)] text-white hover:opacity-90'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-lg',
    md: 'px-4 py-2.5 text-sm rounded-xl',
    lg: 'px-6 py-3 text-base rounded-xl'
  };

  return (
    <button
      ref={ref}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4 -ml-0.5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
