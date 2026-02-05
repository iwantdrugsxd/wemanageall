/**
 * Projects Grid Component
 * Card-based grid view for projects
 */
import { useNavigate } from 'react-router-dom';

export default function ProjectsGrid({
  projects,
  showArchived,
  searchQuery,
  onToggleFavorite,
  onEdit,
  onArchive,
  onUnarchive,
  onDelete,
  onHealth,
  onActivity
}) {
  const navigate = useNavigate();

  // Filter projects by search query
  const filteredProjects = projects.filter(project => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      project.name?.toLowerCase().includes(query) ||
      project.description?.toLowerCase().includes(query) ||
      project.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {filteredProjects.map((project) => (
        <div
          key={project.id}
          onClick={() => navigate(`/projects/${project.id}`)}
          className="rounded-lg overflow-hidden border cursor-pointer transition-all duration-200 group relative"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-subtle)',
            borderLeftWidth: '4px',
            borderLeftColor: 'var(--accent)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
          }}
        >
          {/* Favorite Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(project.id, project.is_favorite);
            }}
            className="absolute top-3 left-3 z-10 p-1.5 rounded transition-colors"
            style={{ backgroundColor: 'var(--bg-card)' }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'var(--bg-surface)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'var(--bg-card)';
            }}
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
          
          {/* Cover Section */}
          <div 
            className="h-32 relative overflow-hidden"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            {project.cover_image_url ? (
              <img
                src={project.cover_image_url}
                alt={project.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--accent)' }}>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">{project.icon || '📋'}</span>
                </div>
              </div>
            )}
            
            {/* Progress Circle */}
            <div className="absolute top-4 right-4">
              <div className="relative w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                <svg className="transform -rotate-90 w-10 h-10">
                  <circle
                    cx="20"
                    cy="20"
                    r="18"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="2"
                    fill="none"
                  />
                  <circle
                    cx="20"
                    cy="20"
                    r="18"
                    stroke="white"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray={2 * Math.PI * 18}
                    strokeDashoffset={2 * Math.PI * 18 * (1 - (project.progress || 0) / 100)}
                    className="transition-all duration-300"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs text-white">{project.progress || 0}%</span>
                </div>
              </div>
            </div>
            
            {/* Project Name Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }}>
              <h3 className="text-base text-white">{project.name}</h3>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-5">
            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {project.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 text-xs rounded"
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      color: 'var(--text-muted)'
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
            <div className="mb-3">
              <p className="text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>Next Task</p>
              {project.nextTask ? (
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--accent)' }}></div>
                  <p className="text-sm line-clamp-1" style={{ color: 'var(--text-primary)' }}>{project.nextTask.title}</p>
                </div>
              ) : (
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No tasks yet</p>
              )}
            </div>
            
            <div className="pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{project.tasksRemaining || 0} tasks remaining</span>
                <div className="flex items-center gap-2">
                  {project.collaborators && project.collaborators.length > 0 && (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--bg-surface)' }}>
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'var(--accent)' }}></div>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>+{project.collaborators.length}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onHealth(project.id);
                      }}
                      className="p-1.5 rounded transition-colors opacity-0 group-hover:opacity-100"
                      style={{ backgroundColor: 'transparent' }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = 'var(--bg-surface)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                      }}
                      title="View health"
                    >
                      <svg className="w-4 h-4" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onActivity(project.id);
                      }}
                      className="p-1.5 rounded transition-colors opacity-0 group-hover:opacity-100"
                      style={{ backgroundColor: 'transparent' }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = 'var(--bg-surface)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                      }}
                      title="View activity"
                    >
                      <svg className="w-4 h-4" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(project);
                      }}
                      className="p-1.5 rounded transition-colors opacity-0 group-hover:opacity-100"
                      style={{ backgroundColor: 'transparent' }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = 'var(--bg-surface)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                      }}
                      title="Edit project"
                    >
                      <svg className="w-4 h-4" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    {showArchived ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUnarchive(project.id);
                        }}
                        className="p-1.5 rounded transition-colors opacity-0 group-hover:opacity-100"
                        style={{ backgroundColor: 'transparent' }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = 'var(--bg-surface)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                        }}
                        title="Unarchive project"
                      >
                        <svg className="w-4 h-4" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Archive this project?')) {
                            onArchive(project.id);
                          }
                        }}
                        className="p-1.5 rounded transition-colors opacity-0 group-hover:opacity-100"
                        style={{ backgroundColor: 'transparent' }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = 'var(--bg-surface)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                        }}
                        title="Archive project"
                      >
                        <svg className="w-4 h-4" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete project "${project.name}"? This cannot be undone.`)) {
                          onDelete(project.id, project.name);
                        }
                      }}
                      className="p-1.5 rounded transition-colors opacity-0 group-hover:opacity-100"
                      style={{ color: 'var(--text-muted)' }}
                      title="Delete project"
                    >
                      <svg 
                        className="w-4 h-4" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Share Code Display */}
              {project.share_code && (
                <div className="flex items-center gap-2 p-2 rounded-lg group mt-2" style={{ backgroundColor: 'var(--bg-surface)' }}>
                  <div className="flex-1">
                    <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Share Code</p>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono tracking-wider px-2 py-1 rounded border" style={{ 
                        backgroundColor: 'var(--bg-card)',
                        borderColor: 'var(--border-subtle)',
                        color: 'var(--text-primary)'
                      }}>
                        {project.share_code}
                      </code>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(project.share_code).then(() => {
                            // Silent copy
                          }).catch(() => {
                            const textArea = document.createElement('textarea');
                            textArea.value = project.share_code;
                            document.body.appendChild(textArea);
                            textArea.select();
                            document.execCommand('copy');
                            document.body.removeChild(textArea);
                          });
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded"
                        style={{ backgroundColor: 'transparent' }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = 'var(--bg-card)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                        }}
                        title="Copy share code"
                      >
                        <svg className="w-4 h-4" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
