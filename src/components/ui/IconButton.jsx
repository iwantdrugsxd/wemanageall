import { forwardRef } from 'react';
import { cn } from '../../lib/cn';

const IconButton = forwardRef(({
  children,
  className,
  'aria-label': ariaLabel,
  size = 'md',
  variant = 'ghost',
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-xl transition-all duration-150 active:scale-[0.95] focus:outline-none focus-visible:shadow-focus-ring';

  const variants = {
    ghost: 'bg-transparent text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]',
    primary: 'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]'
  };

  const sizes = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3'
  };

  return (
    <button
      ref={ref}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </button>
  );
});

IconButton.displayName = 'IconButton';

export default IconButton;
