import { cn } from '../../lib/cn';

/**
 * Work Tabs Component
 * Tab navigation for Work hub views
 */
export default function WorkTabs({ value, onChange }) {
  const tabs = [
    { id: 'tasks', label: 'Tasks' },
    { id: 'calendar', label: 'Calendar' },
    { id: 'notifications', label: 'Notifications' }
  ];

  return (
    <div className="mb-6 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
      <div className="flex items-center gap-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'pb-3 px-2 text-sm font-medium transition-colors capitalize relative',
              value === tab.id
                ? 'text-[var(--text-primary)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            )}
          >
            {tab.label}
            {value === tab.id && (
              <div 
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ backgroundColor: 'var(--accent)' }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
