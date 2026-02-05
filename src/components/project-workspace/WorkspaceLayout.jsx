/**
 * Workspace Layout Component
 * 2-pane layout wrapper for project workspace
 */
import WorkspaceSidebar from './WorkspaceSidebar';
import WorkspaceHeader from './WorkspaceHeader';

export default function WorkspaceLayout({
  project,
  userRole,
  activeSection,
  onSectionChange,
  onEdit,
  onArchive,
  onShare,
  children
}) {
  return (
    <div className="flex h-full">
      {/* Left Sidebar */}
      <WorkspaceSidebar
        activeSection={activeSection}
        onSectionChange={onSectionChange}
      />

      {/* Right Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Header */}
          <WorkspaceHeader
            project={project}
            userRole={userRole}
            onEdit={onEdit}
            onArchive={onArchive}
            onShare={onShare}
          />

          {/* Content */}
          <div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
