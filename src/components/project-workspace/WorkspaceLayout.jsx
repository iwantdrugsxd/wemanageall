import Page from '../layout/Page';
import WorkspaceHeader from './WorkspaceHeader';
import { cn } from '../../lib/cn';

/**
 * Workspace Layout Component
 * Full-width layout with top tabs for project workspace
 */
export default function WorkspaceLayout({
  project,
  userRole,
  activeView,
  onViewChange,
  collaboratorsCount,
  onShare,
  onToggleCollaborators,
  onAddTask,
  onFilter,
  children
}) {
  const views = [
    { id: 'board', label: 'Board', icon: 'M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2' },
    { id: 'list', label: 'List', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
    { id: 'timeline', label: 'Timeline', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'notes', label: 'Notes', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' }
  ];

  const getIcon = (iconPath) => (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
    </svg>
  );

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 overflow-auto">
        <Page>
          {/* Header */}
          <WorkspaceHeader
            project={project}
            userRole={userRole}
            collaboratorsCount={collaboratorsCount}
            onShare={onShare}
            onToggleCollaborators={onToggleCollaborators}
            onAddTask={onAddTask}
            onFilter={onFilter}
          />

          {/* Tabs */}
          <div className="mb-6 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
            <div className="flex gap-1">
              {views.map((view) => (
                <button
                  key={view.id}
                  onClick={() => onViewChange(view.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2',
                    activeView === view.id
                      ? 'text-black border-black'
                      : 'text-gray-500 border-transparent hover:text-black'
                  )}
                >
                  {getIcon(view.icon)}
                  <span>{view.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="w-full">
            {children}
          </div>
        </Page>
      </div>
    </div>
  );
}
