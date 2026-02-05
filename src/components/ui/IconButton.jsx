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
  const baseStyles = 'inline-flex items-center justify-center rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    ghost: 'bg-transparent text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] focus:ring-[var(--accent)]',
    primary: 'bg-[var(--accent)] text-[var(--bg-base)] hover:opacity-90 focus:ring-[var(--accent)]'
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
