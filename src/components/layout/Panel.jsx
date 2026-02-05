import { cn } from '../../lib/cn';

export default function Panel({ 
  children, 
  title, 
  actions, 
  className,
  headerClassName,
  bodyClassName,
  ...props 
}) {
  return (
    <div
      className={cn(
        'rounded-lg border transition-colors',
        'bg-[var(--bg-card)] border-[var(--border-subtle)]',
        className
      )}
      {...props}
    >
      {(title || actions) && (
        <div className={cn('px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between', headerClassName)}>
          {title && (
            <h3 className="text-lg font-medium transition-colors" style={{ color: 'var(--text-primary)' }}>
              {title}
            </h3>
          )}
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}
      <div className={cn('px-6 py-4', bodyClassName)}>
        {children}
      </div>
    </div>
  );
}
