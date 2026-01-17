import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Projects() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    start_date: new Date().toISOString().split('T')[0],
    color: '#000000',
    icon: '📋',
    tags: []
  });
  const [showFilters, setShowFilters] = useState(false);
  const [filterTag, setFilterTag] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [availableTags, setAvailableTags] = useState([]);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);
  
  // Color and icon options
  const colorOptions = [
    '#000000', '#000000', '#000000', '#000000', '#000000',
    '#000000', '#000000', '#000000', '#000000', '#000000'
  ];
  
  const iconOptions = ['📋', '🚀', '💡', '🎯', '📚', '🏗️', '🎨', '🔬', '💼', '🌟'];

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user, showFavoritesOnly, filterTag]);

  const fetchTags = async () => {
    try {
      const allTags = new Set();
      const response = await fetch('/api/projects', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        data.projects?.forEach(project => {
          project.tags?.forEach(tag => allTags.add(tag));
        });
        setAvailableTags(Array.from(allTags));
      }
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    }
  };
  
  const handleToggleFavorite = async (projectId, currentFavorite) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/favorite`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ is_favorite: !currentFavorite }),
      });
      
      if (response.ok) {
        await fetchProjects();
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleDeleteProject = async (projectId, projectName) => {
    if (!confirm(`Are you sure you want to delete "${projectName}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (response.ok) {
        await fetchProjects();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete project. Please try again.');
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('Network error. Please check your connection and try again.');
    }
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      let url = '/api/projects?';
      if (showFavoritesOnly) url += 'favorite=true&';
      if (filterTag) url += `tag=${encodeURIComponent(filterTag)}&`;
      url += 'archived=false';
      
      const response = await fetch(url, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        const projectsList = data.projects || [];
        
        // The backend now includes share_code in the response, so we don't need to fetch individually
        // But we'll still fetch if share_code is missing for any project
        const projectsWithShareCodes = await Promise.all(projectsList.map(async (project) => {
          // If share_code is already included, use it
          if (project.share_code) {
            return project;
          }
          
          // Otherwise, fetch it (but don't block on errors)
          try {
            const shareResponse = await fetch(`/api/projects/${project.id}`, {
              credentials: 'include',
            });
            if (shareResponse.ok) {
              const projectData = await shareResponse.json();
              return {
                ...project,
                share_code: projectData.share_code || null
              };
            }
            return project;
          } catch (error) {
            // Silently fail - share code is optional
            return project;
          }
        }));
        
        // Sort projects: favorites first, then by creation date (newest first)
        const sortedProjects = projectsWithShareCodes.sort((a, b) => {
          if (a.is_favorite && !b.is_favorite) return -1;
          if (!a.is_favorite && b.is_favorite) return 1;
          const dateA = new Date(a.created_at || 0);
          const dateB = new Date(b.created_at || 0);
          return dateB - dateA; // Newest first
        });
        
        setProjects(sortedProjects);
        
        // Update available tags
        const allTags = new Set();
        sortedProjects.forEach(project => {
          if (project.tags && Array.isArray(project.tags)) {
            project.tags.forEach(tag => allTags.add(tag));
          }
        });
        setAvailableTags(Array.from(allTags));
      } else if (response.status === 401) {
        // User not authenticated
        console.log('Not authenticated');
        // Don't redirect here - let the auth context handle it
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newProject),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Store project info before resetting form
        const createdProjectName = newProject.name;
        const createdProjectId = data.project?.id;
        
        // Close modal and reset form first
        setShowCreateModal(false);
        setNewProject({ name: '', description: '', start_date: new Date().toISOString().split('T')[0], color: '#000000', icon: '📋', tags: [] });
        setError(null);
        
        // Refresh projects list FIRST to show the new project card
        await fetchProjects();
        
        // Show share code if available
        if (data.share_code) {
          const shareMessage = `Project created! Share code: ${data.share_code}\n\nShare this code with others to collaborate on this project.`;
          alert(shareMessage);
        }
        
        // Small delay to ensure UI updates, then navigate
        setTimeout(() => {
          if (createdProjectId) {
            navigate(`/projects/${createdProjectId}`);
          } else {
            // Fallback: fetch projects again and navigate to the newly created one
            fetch('/api/projects?archived=false', { credentials: 'include' })
              .then(res => res.json())
              .then(updatedData => {
                const updatedProjects = updatedData.projects || [];
                if (updatedProjects.length > 0) {
                  const projectToNavigate = updatedProjects.find(p => 
                    p.name === createdProjectName
                  ) || updatedProjects[0];
                  
                  if (projectToNavigate && projectToNavigate.id) {
                    navigate(`/projects/${projectToNavigate.id}`);
                  }
                }
              });
          }
        }, 300);
      } else {
        // Handle error response
        setError(data.error || 'Failed to create project. Please try again.');
      }
    } catch (error) {
      console.error('Failed to create project:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setCreating(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 text-center">
        <div className="text-gray-600">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
      {/* Header */}
        <div className="mb-8">
        <p className="text-sm text-black mb-2">PERSONAL LIFE OS</p>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="font-display text-4xl font-bold text-black mb-2">Project Selection Hub</h1>
            <p className="text-gray-600">Choose a focus area for your current session.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
                showFavoritesOnly
                  ? 'bg-black text-white'
                  : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <svg className="w-4 h-4" fill={showFavoritesOnly ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              Favorites
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter
            </button>
            <button
              onClick={() => setShowJoinModal(true)}
              className="px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-900 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Join Project
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mb-6 p-4 bg-white rounded-xl border border-gray-300">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-black mb-2">Filter by Tag</label>
                <select
                  value={filterTag}
                  onChange={(e) => {
                    setFilterTag(e.target.value);
                    setTimeout(fetchProjects, 100);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-black"
                >
                  <option value="">All Tags</option>
                  {availableTags.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>
              {filterTag && (
                <button
                  onClick={() => {
                    setFilterTag('');
                    setTimeout(fetchProjects, 100);
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-black"
                >
                  Clear Filter
                </button>
              )}
              </div>
          </div>
        )}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Create New Project Card */}
        <div
          onClick={() => setShowCreateModal(true)}
          className="bg-white rounded-lg p-8 border-2 border-dashed border-gray-300 hover:border-black cursor-pointer transition-all duration-200 group"
        >
          <div className="flex flex-col items-center justify-center h-full min-h-[250px]">
            <div className="w-12 h-12 rounded-lg bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center mb-4 transition-colors">
              <span className="text-2xl text-black">+</span>
                </div>
            <h3 className="text-base text-black mb-1" style={{ color: '#000000' }}>Create New Project</h3>
            <p className="text-xs text-black text-center" style={{ color: '#000000', opacity: 0.5 }}>Start from scratch</p>
                </div>
              </div>

        {/* Existing Project Cards */}
                {projects.map((project) => (
                  <div
                    key={project.id}
            onClick={() => navigate(`/projects/${project.id}`)}
            className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-black cursor-pointer transition-all duration-200 group relative"
            style={{ borderLeftColor: '#000000', borderLeftWidth: '4px' }}
          >
            {/* Favorite Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFavorite(project.id, project.is_favorite);
              }}
              className="absolute top-3 left-3 z-10 p-1.5 rounded bg-white hover:bg-gray-50 transition-colors"
            >
              <svg 
                className={`w-4 h-4 ${project.is_favorite ? 'text-black fill-current' : 'text-black'}`}
                style={{ color: project.is_favorite ? '#000000' : 'rgba(0,0,0,0.3)' }}
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
              style={{ backgroundColor: '#000000' }}
            >
              {project.cover_image_url ? (
                <img
                  src={project.cover_image_url}
                  alt={project.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#000000' }}>
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
                    <span className="text-xs text-white" style={{ color: '#ffffff' }}>{project.progress || 0}%</span>
                  </div>
                </div>
              </div>
              
              {/* Project Name Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }}>
                <h3 className="text-base text-white" style={{ color: '#ffffff' }}>{project.name}</h3>
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
                      className="px-2 py-0.5 text-xs bg-gray-100 rounded text-black"
                      style={{ color: '#000000' }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="mb-3">
                <p className="text-xs text-black uppercase tracking-wide mb-2" style={{ color: '#000000' }}>Next Task</p>
                {project.nextTask ? (
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#000000' }}></div>
                    <p className="text-sm text-black line-clamp-1" style={{ color: '#000000' }}>{project.nextTask.title}</p>
                  </div>
                ) : (
                  <p className="text-sm text-black" style={{ color: '#000000', opacity: 0.5 }}>No tasks yet</p>
                )}
              </div>
              
              <div className="pt-3 border-t" style={{ borderColor: '#e5e5e5' }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-black" style={{ color: '#000000' }}>{project.tasksRemaining || 0} tasks remaining</span>
                  <div className="flex items-center gap-2">
                    {project.collaborators && project.collaborators.length > 0 && (
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#000000' }}></div>
                        <span className="text-xs text-black" style={{ color: '#000000' }}>+{project.collaborators.length}</span>
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(project.id, project.name);
                      }}
                      className="p-1.5 rounded hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
                      style={{ color: '#000000' }}
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
                
                {/* Share Code Display */}
                {project.share_code && (
                  <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg group">
                    <div className="flex-1">
                      <p className="text-xs text-black font-medium mb-1">Share Code</p>
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono tracking-wider text-black bg-white px-2 py-1 rounded border border-gray-300">
                          {project.share_code}
                        </code>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(project.share_code).then(() => {
                              alert('Share code copied to clipboard!');
                            }).catch(() => {
                              // Fallback if clipboard API fails
                              const textArea = document.createElement('textarea');
                              textArea.value = project.share_code;
                              document.body.appendChild(textArea);
                              textArea.select();
                              document.execCommand('copy');
                              document.body.removeChild(textArea);
                              alert('Share code copied to clipboard!');
                            });
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded"
                          title="Copy share code"
                        >
                          <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* Create Project Modal */}
      {showCreateModal && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => {
            if (!creating) {
              setShowCreateModal(false);
              setNewProject({ name: '', description: '', start_date: new Date().toISOString().split('T')[0] });
              setError(null);
            }
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-2xl font-semibold text-black mb-2">Create New Project</h3>
            <p className="text-sm text-gray-600 mb-6">Start a new focus area for your work.</p>
            
            {error && (
              <div className="mb-4 p-3 bg-gray-100 border text-black rounded-xl">
                <p className="text-sm text-black">{error}</p>
              </div>
            )}
            
            <form onSubmit={handleCreateProject}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-black mb-2">Project Name</label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  placeholder="e.g., Life OS Development"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-black"
                  required
                  autoFocus
                />
          </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-black mb-2">Description (optional)</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="What is this project about?"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-black resize-none"
                  rows={3}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-black mb-2">Start Date (optional)</label>
                <input
                  type="date"
                  value={newProject.start_date}
                  onChange={(e) => setNewProject({ ...newProject, start_date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-black"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-900 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {creating ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    'Create Project'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewProject({ name: '', description: '', start_date: new Date().toISOString().split('T')[0], color: '#000000', icon: '📋', tags: [] });
                    setError(null);
                  }}
                  disabled={creating}
                  className="px-6 py-3 bg-white border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
                  </div>
                </div>
      )}

      {/* Join Project Modal */}
      {showJoinModal && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => {
            setShowJoinModal(false);
            setJoinCode('');
            setError(null);
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-2xl font-semibold text-black mb-2">Join Project</h3>
            <p className="text-sm text-gray-600 mb-6">Enter the share code to join a project.</p>
            
            {error && (
              <div className="mb-4 p-3 bg-gray-100 border text-black rounded-xl">
                <p className="text-sm text-black">{error}</p>
              </div>
            )}
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              setJoining(true);
              setError(null);
              
              try {
                const response = await fetch('/api/projects/join', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({ share_code: joinCode.trim().toUpperCase() }),
                });
                
                const data = await response.json();
                
                if (response.ok) {
                  setShowJoinModal(false);
                  setJoinCode('');
                  setError(null);
                  await fetchProjects();
                  if (data.project_id) {
                    navigate(`/projects/${data.project_id}`);
                  }
                } else {
                  setError(data.error || 'Failed to join project. Please check the code and try again.');
                }
              } catch (error) {
                console.error('Failed to join project:', error);
                setError('Network error. Please check your connection and try again.');
              } finally {
                setJoining(false);
              }
            }}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-black mb-2">Share Code</label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Enter 8-character code"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-black text-center text-2xl font-mono tracking-widest"
                  maxLength={8}
                  required
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-2 text-center">Ask the project owner for the share code</p>
              </div>
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={joining || !joinCode.trim()}
                  className="flex-1 px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-900 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {joining ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Joining...
                    </>
                  ) : (
                    'Join Project'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowJoinModal(false);
                    setJoinCode('');
                    setError(null);
                  }}
                  disabled={joining}
                  className="px-6 py-3 bg-white border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
              </div>
            </div>
          )}
      </div>
  );
}
