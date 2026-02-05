import { cn } from '../../lib/cn';

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
        <div className="text-6xl mb-4 flex justify-center">
          {icon}
        </div>
      )}
      {title && (
        <h3 className="text-lg font-medium mb-2 transition-colors" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h3>
      )}
      {description && (
        <p className="text-sm mb-4 transition-colors" style={{ color: 'var(--text-muted)' }}>
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
