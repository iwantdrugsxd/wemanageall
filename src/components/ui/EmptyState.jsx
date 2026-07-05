import { cn } from '../../lib/cn';

/**
 * EmptyState - shown a lot in a life-OS app (empty task list, no events
 * today, no thoughts yet). Framed encouragingly rather than as an error
 * or a void: an empty list is a fresh start, not a failure.
 */
export default function EmptyState({
  icon,
  title,
  description,
  action,
  className
}) {
  return (
    <div className={cn('text-center py-12 px-4', className)}>
      {icon && (
        <div
          className="w-12 h-12 mx-auto mb-4 rounded-2xl flex items-center justify-center text-2xl"
          style={{ backgroundColor: 'var(--bg-surface)' }}
        >
          {icon}
        </div>
      )}
      {title && (
        <h3 className="text-base font-semibold mb-1.5 transition-colors" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h3>
      )}
      {description && (
        <p className="text-sm mb-4 max-w-sm mx-auto leading-relaxed transition-colors" style={{ color: 'var(--text-muted)' }}>
          {description}
        </p>
      )}
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
}
