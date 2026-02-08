/**
 * Projects Table Component
 * Enterprise table view for projects
 */
import { useNavigate } from 'react-router-dom';
import IconButton from '../ui/IconButton';
import Badge from '../ui/Badge';
import { cn } from '../../lib/cn';

export default function ProjectsTable({
  projects,
  showArchived,
  searchQuery,
  onToggleFavorite,
  onEdit,
  onArchive,
  onUnarchive,
  onDelete,
  onHealth,
  onActivity,
  formatDate,
  onRowClick,
  onSaveAsTemplate
}) {
  const navigate = useNavigate();

  // Note: Projects are already filtered by searchQuery in parent component

  const getStatusColor = (progress) => {
    if (progress >= 75) return 'text-green-600';
    if (progress >= 50) return 'text-blue-600';
    if (progress >= 25) return 'text-yellow-600';
    return 'text-gray-600';
  };

  if (projects.length === 0) {
    return null; // Empty state handled by parent
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr 
            className="border-b"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Name</th>
            <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Status</th>
            <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Progress</th>
            <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Start Date</th>
            <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Tags</th>
            <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Updated</th>
            <th className="text-right py-3 px-4 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr
              key={project.id}
              onClick={() => {
                if (onRowClick) {
                  onRowClick(project);
                } else {
                  navigate(`/projects/${project.id}`);
                }
              }}
              className="border-b cursor-pointer hover:bg-opacity-50 transition-colors"
              style={{ 
                borderColor: 'var(--border-subtle)',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(project.id, project.is_favorite);
                    }}
                    className="flex-shrink-0"
                  >
                    <svg 
                      className={`w-4 h-4 ${project.is_favorite ? 'fill-current' : ''}`}
                      style={{ color: project.is_favorite ? 'var(--accent)' : 'var(--text-muted)' }}
                      fill={project.is_favorite ? "currentColor" : "none"} 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{project.icon || '📋'}</span>
                    <div>
                      <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{project.name}</div>
                      {project.description && (
                        <div className="text-sm truncate max-w-xs" style={{ color: 'var(--text-muted)' }}>
                          {project.description}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4">
                <Badge variant={project.archived ? 'neutral' : 'success'}>
                  {project.archived ? 'Archived' : 'Active'}
                </Badge>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${project.progress || 0}%`,
                        backgroundColor: 'var(--accent)'
                      }}
                    />
                  </div>
                  <span className={`text-sm ${getStatusColor(project.progress || 0)}`}>
                    {project.progress || 0}%
                  </span>
                </div>
              </td>
              <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                {project.start_date ? formatDate(project.start_date) : '-'}
              </td>
              <td className="py-3 px-4">
                <div className="flex flex-wrap gap-1">
                  {project.tags && project.tags.length > 0 ? (
                    project.tags.slice(0, 2).map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: 'var(--bg-surface)',
                          color: 'var(--text-muted)'
                        }}
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>-</span>
                  )}
                  {project.tags && project.tags.length > 2 && (
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      +{project.tags.length - 2}
                    </span>
                  )}
                </div>
              </td>
              <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                {project.updated_at ? formatDate(project.updated_at) : '-'}
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                  <IconButton
                    variant="ghost"
                    size="sm"
                    onClick={() => onHealth(project.id)}
                    aria-label="View health"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </IconButton>
                  <IconButton
                    variant="ghost"
                    size="sm"
                    onClick={() => onActivity(project.id)}
                    aria-label="View activity"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </IconButton>
                  <IconButton
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(project)}
                    aria-label="Edit project"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </IconButton>
                  {onSaveAsTemplate && (
                    <IconButton
                      variant="ghost"
                      size="sm"
                      onClick={(e) => onSaveAsTemplate(project, e)}
                      aria-label="Save as template"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                      </svg>
                    </IconButton>
                  )}
                  {showArchived ? (
                    <IconButton
                      variant="ghost"
                      size="sm"
                      onClick={() => onUnarchive(project.id)}
                      aria-label="Unarchive project"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                    </IconButton>
                  ) : (
                    <IconButton
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm('Archive this project?')) {
                          onArchive(project.id);
                        }
                      }}
                      aria-label="Archive project"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                    </IconButton>
                  )}
                  <IconButton
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm(`Delete project "${project.name}"? This cannot be undone.`)) {
                        onDelete(project.id, project.name);
                      }
                    }}
                    aria-label="Delete project"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </IconButton>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
