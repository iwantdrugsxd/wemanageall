/**
 * Projects Header Component
 * Displays page title, summary, and action buttons
 */
export default function ProjectsHeader({
  projects,
  showFavoritesOnly,
  showArchived,
  onNewProject,
  onShowTemplates
}) {
  const activeProjects = projects.filter(p => !p.archived);
  const favoriteCount = projects.filter(p => p.is_favorite && !p.archived).length;
  const archivedCount = projects.filter(p => p.archived).length;

  const getSummary = () => {
    if (showArchived) {
      return `${archivedCount} archived project${archivedCount !== 1 ? 's' : ''}`;
    }
    if (showFavoritesOnly) {
      return `${favoriteCount} favorite${favoriteCount !== 1 ? 's' : ''}`;
    }
    return `${activeProjects.length} active project${activeProjects.length !== 1 ? 's' : ''}`;
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-light transition-colors mb-2" style={{ color: 'var(--text-primary)' }}>
            Projects
          </h1>
          <p className="text-sm transition-colors" style={{ color: 'var(--text-muted)' }}>
            {getSummary()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onShowTemplates}
            className="px-4 py-2 rounded-lg text-sm transition-colors border"
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
            Templates
          </button>
          <button
            onClick={onNewProject}
            className="px-4 py-2 rounded-lg text-sm transition-colors"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--bg-base)'
            }}
          >
            New Project
          </button>
        </div>
      </div>
    </div>
  );
}
