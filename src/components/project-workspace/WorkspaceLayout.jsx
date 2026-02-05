import Page from '../layout/Page';
import WorkspaceNav from './WorkspaceSidebar';
import WorkspaceHeader from './WorkspaceHeader';

/**
 * Workspace Layout Component
 * 2-pane layout wrapper for project workspace
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
  return (
    <div className="flex h-full">
      {/* Left Internal Nav */}
      <WorkspaceNav
        activeView={activeView}
        onViewChange={onViewChange}
      />

      {/* Right Content */}
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

          {/* Content */}
          <div>
            {children}
          </div>
        </Page>
      </div>
    </div>
  );
}
