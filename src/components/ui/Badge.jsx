import { cn } from '../../lib/cn';

// Color-to-meaning mapping stays consistent with the rest of the app:
// terracotta/brand = needs action, sage/success = done or growing,
// slate-blue/info = neutral information, amber/warning, red/danger.
const variantStyles = {
  neutral: 'bg-[var(--bg-surface)] text-[var(--text-secondary)]',
  info: 'bg-[var(--status-info-bg)] text-[var(--status-info-fg)]',
  success: 'bg-[var(--status-success-bg)] text-[var(--status-success-fg)]',
  warning: 'bg-[var(--status-warning-bg)] text-[var(--status-warning-fg)]',
  danger: 'bg-[var(--status-danger-bg)] text-[var(--status-danger-fg)]',
  brand: 'bg-[var(--accent-soft)] text-[var(--accent-hover)]'
};

export default function Badge({ children, variant = 'neutral', className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition-colors',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
