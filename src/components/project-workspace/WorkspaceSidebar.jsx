import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import { cn } from '../../lib/cn';

/**
 * Workspace Nav Component
 * Internal navigation for project workspace views
 */
export default function WorkspaceNav({
  activeView,
  onViewChange
}) {
  const views = [
    { id: 'board', label: 'Board', icon: 'M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2' },
    { id: 'list', label: 'List', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
    { id: 'timeline', label: 'Timeline', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'notes', label: 'Notes', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' }
  ];

  const getIcon = (iconPath) => (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
    </svg>
  );

  return (
    <div 
      className="w-64 flex-shrink-0 border-r flex flex-col"
      style={{
        backgroundColor: 'var(--bg-base)',
        borderColor: 'var(--border-subtle)'
      }}
    >
      {/* Back to Projects */}
      <div className="p-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="w-full justify-start"
        >
          <Link to="/projects">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Projects
          </Link>
        </Button>
      </div>

      {/* View Navigation */}
      <nav className="p-4 space-y-1 flex-1">
        {views.map((view) => (
          <button
            key={view.id}
            onClick={() => onViewChange(view.id)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
              activeView === view.id
                ? 'bg-[var(--accent)] text-[var(--bg-base)]'
                : 'text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]'
            )}
          >
            {getIcon(view.icon)}
            <span className="font-medium">{view.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
