import { cn } from '../../lib/cn';

export default function PageHeader({ title, subtitle, actions, className, ...props }) {
  return (
    <div className={cn('mb-6', className)} {...props}>
      <div className="flex items-center justify-between">
        <div>
          {title && (
            <h1 className="text-3xl md:text-4xl font-light transition-colors mb-1" style={{ color: 'var(--text-primary)' }}>
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-sm transition-colors" style={{ color: 'var(--text-muted)' }}>
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
