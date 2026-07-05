import { cn } from '../../lib/cn';

export default function Tabs({ value, onValueChange, children, className }) {
  return (
    <div className={cn('flex items-center gap-1 border-b', 'border-[var(--border-subtle)]', className)}>
      {children}
    </div>
  );
}

export function TabsList({ children, className }) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {children}
    </div>
  );
}

export function TabsTrigger({ value, activeValue, onValueChange, children, className }) {
  const isActive = value === activeValue;

  return (
    <button
      onClick={() => onValueChange(value)}
      className={cn(
        'px-3.5 py-2.5 text-sm font-medium transition-colors duration-150 relative rounded-t-lg',
        isActive
          ? 'text-[var(--text-primary)]'
          : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]',
        className
      )}
    >
      {children}
      {isActive && (
        <div
          className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
          style={{ backgroundColor: 'var(--accent)' }}
        />
      )}
    </button>
  );
}

export function TabsContent({ value, activeValue, children, className }) {
  if (value !== activeValue) return null;

  return (
    <div className={cn('mt-4 animate-[rise_0.3s_ease-out]', className)}>
      {children}
    </div>
  );
}
