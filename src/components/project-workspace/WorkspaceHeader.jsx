/**
 * Workspace Header Component
 * Project header with title and actions
 */
export default function WorkspaceHeader({
  project,
  userRole,
  onEdit,
  onArchive,
  onShare
}) {
  return (
    <div 
      className="mb-6 pb-4 border-b"
      style={{ borderColor: 'var(--border-subtle)' }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-light transition-colors mb-1" style={{ color: 'var(--text-primary)' }}>
            {project?.name || 'Project'}
          </h1>
          {project?.description && (
            <p className="text-sm transition-colors mt-1" style={{ color: 'var(--text-muted)' }}>
              {project.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {(userRole === 'owner' || userRole === 'admin') && (
            <>
              <button
                onClick={onEdit}
                className="px-3 py-1.5 rounded-lg text-sm transition-colors border"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-primary)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'var(--bg-surface)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'var(--bg-card)';
                }}
              >
                Edit
              </button>
              <button
                onClick={onArchive}
                className="px-3 py-1.5 rounded-lg text-sm transition-colors border"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-primary)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'var(--bg-surface)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'var(--bg-card)';
                }}
              >
                Archive
              </button>
            </>
          )}
          <button
            onClick={onShare}
            className="px-3 py-1.5 rounded-lg text-sm transition-colors"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--bg-base)'
            }}
          >
            Share
          </button>
        </div>
      </div>
    </div>
  );
}
