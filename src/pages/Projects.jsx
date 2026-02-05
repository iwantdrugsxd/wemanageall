import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Page from '../components/layout/Page';
import ProjectsHeader from '../components/projects/ProjectsHeader';
import ProjectsToolbar from '../components/projects/ProjectsToolbar';
import ProjectsTable from '../components/projects/ProjectsTable';
import ProjectsGrid from '../components/projects/ProjectsGrid';
import UpgradeGate from '../components/UpgradeGate';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import DatabaseToolbar from '../components/database/DatabaseToolbar';
import PropertiesDrawer from '../components/database/PropertiesDrawer';
import { useSavedViews } from '../hooks/useSavedViews';

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
    tags: [],
    cover_image_url: null
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterTag, setFilterTag] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [availableTags, setAvailableTags] = useState([]);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [editProjectData, setEditProjectData] = useState({});
  const [templates, setTemplates] = useState([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateIsPublic, setTemplateIsPublic] = useState(false);
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [healthData, setHealthData] = useState(null);
  const [activityData, setActivityData] = useState([]);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid' - default to table
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [showPropertiesDrawer, setShowPropertiesDrawer] = useState(false);
  const [sortField, setSortField] = useState({ field: '', direction: 'asc' });
  const [groupBy, setGroupBy] = useState(null);
  
  // Saved views integration
  const savedViews = useSavedViews('projects');
  
  // Color and icon options
  const colorOptions = [
    '#000000', '#000000', '#000000', '#000000', '#000000',
    '#000000', '#000000', '#000000', '#000000', '#000000'
  ];
  
  const iconOptions = ['📋', '🚀', '💡', '🎯', '📚', '🏗️', '🎨', '🔬', '💼', '🌟'];

  useEffect(() => {
    if (user) {
      fetchProjects();
      fetchTemplates();
    }
  }, [user, showFavoritesOnly, filterTag, showArchived]);

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

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/projects/templates', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setEditProjectData({
      name: project.name || '',
      description: project.description || '',
      start_date: project.start_date || new Date().toISOString().split('T')[0],
      color: project.color || '#000000',
      icon: project.icon || '📋',
      tags: project.tags || [],
      cover_image_url: project.cover_image_url || null
    });
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    if (!editingProject) return;
    
    try {
      const response = await fetch(`/api/projects/${editingProject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editProjectData),
      });
      
      if (response.ok) {
        setEditingProject(null);
        setEditProjectData({});
        await fetchProjects();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update project');
      }
    } catch (error) {
      console.error('Failed to update project:', error);
      alert('Network error. Please check your connection.');
    }
  };

  const handleArchiveProject = async (projectId) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/archive`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        await fetchProjects();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to archive project');
      }
    } catch (error) {
      console.error('Failed to archive project:', error);
      alert('Network error. Please check your connection.');
    }
  };

  const handleUnarchiveProject = async (projectId) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/unarchive`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        await fetchProjects();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to unarchive project');
      }
    } catch (error) {
      console.error('Failed to unarchive project:', error);
      alert('Network error. Please check your connection.');
    }
  };

  const handleRegenerateShareCode = async (projectId) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ access_level: 'editor' }),
      });
      
      if (response.ok) {
        const data = await response.json();
        await fetchProjects();
        alert(`New share code: ${data.share_code}`);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to regenerate share code');
      }
    } catch (error) {
      console.error('Failed to regenerate share code:', error);
      alert('Network error. Please check your connection.');
    }
  };

  const handleSaveAsTemplate = async (project) => {
    if (!templateName.trim()) {
      alert('Template name is required');
      return;
    }
    
    setSavingTemplate(true);
    try {
      const response = await fetch('/api/projects/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: templateName.trim(),
          description: templateDescription.trim() || null,
          project_id: project.id,
          icon: project.icon || '📋',
          color: project.color || '#000000',
          is_public: templateIsPublic
        }),
      });
      
      if (response.ok) {
        setTemplateName('');
        setTemplateDescription('');
        setTemplateIsPublic(false);
        setShowTemplates(false);
        await fetchTemplates();
        alert('Template saved successfully!');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to save template');
      }
    } catch (error) {
      console.error('Failed to save template:', error);
      alert('Network error. Please check your connection.');
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleApplyTemplate = async (templateId) => {
    setCreating(true);
    try {
      const template = templates.find(t => t.id === templateId);
      if (!template) return;
      
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: `${template.name} (Copy)`,
          description: template.description || '',
          color: template.color || '#000000',
          icon: template.icon || '📋',
          template_id: templateId
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setShowCreateModal(false);
        setShowTemplates(false);
        await fetchProjects();
        if (data.project?.id) {
          navigate(`/projects/${data.project.id}`);
        }
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to create project from template');
      }
    } catch (error) {
      console.error('Failed to apply template:', error);
      alert('Network error. Please check your connection.');
    } finally {
      setCreating(false);
    }
  };

  const handleFetchHealth = async (projectId) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/health`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setHealthData(data.health);
        setShowHealthModal(true);
      }
    } catch (error) {
      console.error('Failed to fetch health:', error);
    }
  };

  const handleFetchActivity = async (projectId) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/activity?limit=20`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setActivityData(data.activity || []);
        setShowActivityModal(true);
      }
    } catch (error) {
      console.error('Failed to fetch activity:', error);
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
      url += showArchived ? 'archived=true' : 'archived=false';
      
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
        setNewProject({ name: '', description: '', start_date: new Date().toISOString().split('T')[0], color: '#000000', icon: '📋', tags: [], cover_image_url: null });
        setImagePreview(null);
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
        if (data.upgradeRequired) {
          // Redirect to pricing page
          navigate('/pricing', { 
            state: { message: data.error || 'Upgrade required to create more projects.' } 
          });
        } else {
        setError(data.error || 'Failed to create project. Please try again.');
        }
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

  // Apply saved view if active
  useEffect(() => {
    const activeView = savedViews.getActiveView();
    if (activeView) {
      setViewMode(activeView.viewType || 'table');
      setSearchQuery(activeView.search || '');
      if (activeView.sort) setSortField(activeView.sort);
      if (activeView.group) setGroupBy(activeView.group);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedViews.activeViewId]);

  // Client-side search filtering
  let filteredProjects = projects.filter(project => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      project.name?.toLowerCase().includes(query) ||
      project.description?.toLowerCase().includes(query) ||
      project.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  });

  // Apply sorting
  if (sortField.field) {
    filteredProjects = [...filteredProjects].sort((a, b) => {
      let aVal = a[sortField.field];
      let bVal = b[sortField.field];
      
      if (sortField.field === 'updated_at' || sortField.field === 'created_at' || sortField.field === 'start_date') {
        aVal = new Date(aVal || 0);
        bVal = new Date(bVal || 0);
      }
      
      if (aVal < bVal) return sortField.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortField.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Handle row click to open properties drawer
  const handleProjectClick = (project) => {
    setSelectedProject(project);
    setShowPropertiesDrawer(true);
  };

  // Save current view
  const handleSaveCurrentView = (name) => {
    savedViews.saveCurrentAsView(name, {
      viewType: viewMode,
      filters: { favorites: showFavoritesOnly, archived: showArchived, tag: filterTag },
      sort: sortField,
      group: groupBy,
      search: searchQuery
    });
  };

  if (loading) {
    return (
      <Page>
        <div className="text-center py-12">
          <div className="transition-colors" style={{ color: 'var(--text-muted)' }}>Loading projects...</div>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      {/* Header */}
      <ProjectsHeader
        projects={projects}
        showFavoritesOnly={showFavoritesOnly}
        showArchived={showArchived}
        onNewProject={() => setShowCreateModal(true)}
        onJoinProject={() => setShowJoinModal(true)}
      />

      {/* Database Toolbar */}
      <DatabaseToolbar
        viewType={viewMode}
        onViewChange={setViewMode}
        search={searchQuery}
        onSearchChange={setSearchQuery}
        filters={{ favorites: showFavoritesOnly, archived: showArchived, tag: filterTag }}
        onFiltersChange={(filters) => {
          setShowFavoritesOnly(filters.favorites || false);
          setShowArchived(filters.archived || false);
          setFilterTag(filters.tag || '');
          setTimeout(fetchProjects, 100);
        }}
        sort={sortField}
        onSortChange={setSortField}
        group={groupBy}
        onGroupChange={setGroupBy}
        savedViews={savedViews}
        onNew={() => setShowCreateModal(true)}
      />

      {/* Legacy Toolbar (for backward compatibility with filters) */}
      <div className="mb-4 flex items-center gap-2 flex-wrap">
        <Button
          variant={showFavoritesOnly ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => {
            setShowFavoritesOnly(!showFavoritesOnly);
            setTimeout(fetchProjects, 100);
          }}
        >
          ⭐ Favorites
        </Button>
        <Button
          variant={showArchived ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => {
            setShowArchived(!showArchived);
            setTimeout(fetchProjects, 100);
          }}
        >
          {showArchived ? 'Active' : 'Archived'}
        </Button>
        <select
          value={filterTag}
          onChange={(e) => {
            setFilterTag(e.target.value);
            setTimeout(fetchProjects, 100);
          }}
          className="px-3 py-1.5 text-sm border rounded-lg"
          style={{
            borderColor: 'var(--border-subtle)',
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text-primary)'
          }}
        >
          <option value="">All Tags</option>
          {availableTags.map(tag => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
      </div>

      {/* Upgrade Gate */}
      <UpgradeGate message="Upgrade to unlock unlimited projects and advanced features" />

      {/* Projects View */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          title={searchQuery ? "No projects found" : "No projects yet"}
          description={searchQuery ? "Try adjusting your search or filters" : "Create your first project to get started"}
          action={
            <Button
              variant="primary"
              onClick={() => setShowCreateModal(true)}
            >
              Create Project
            </Button>
          }
        />
      ) : viewMode === 'table' ? (
        <div 
          className="rounded-lg border overflow-hidden"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-subtle)'
          }}
        >
          <ProjectsTable
            projects={filteredProjects}
            showArchived={showArchived}
            searchQuery={searchQuery}
            onToggleFavorite={handleToggleFavorite}
            onEdit={handleEditProject}
            onArchive={handleArchiveProject}
            onUnarchive={handleUnarchiveProject}
            onDelete={handleDeleteProject}
            onHealth={handleFetchHealth}
            onActivity={handleFetchActivity}
            formatDate={formatDate}
            onRowClick={handleProjectClick}
          />
        </div>
      ) : (
        <div>
          {/* Create New Project Card (only in grid view) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div
              onClick={() => setShowCreateModal(true)}
              className="rounded-lg p-8 border-2 border-dashed cursor-pointer transition-all duration-200 group"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-subtle)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
              }}
            >
              <div className="flex flex-col items-center justify-center h-full min-h-[250px]">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-colors"
                  style={{ backgroundColor: 'var(--bg-surface)' }}
                >
                  <span className="text-2xl" style={{ color: 'var(--text-primary)' }}>+</span>
                </div>
                <h3 className="text-base mb-1" style={{ color: 'var(--text-primary)' }}>Create New Project</h3>
                <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>Start from scratch</p>
              </div>
            </div>
          </div>
          <ProjectsGrid
            projects={filteredProjects}
            showArchived={showArchived}
            searchQuery={searchQuery}
            onToggleFavorite={handleToggleFavorite}
            onEdit={handleEditProject}
            onArchive={handleArchiveProject}
            onUnarchive={handleUnarchiveProject}
            onDelete={handleDeleteProject}
            onHealth={handleFetchHealth}
            onActivity={handleFetchActivity}
          />
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => {
            if (!creating) {
              setShowCreateModal(false);
              setNewProject({ name: '', description: '', start_date: new Date().toISOString().split('T')[0], color: '#000000', icon: '📋', tags: [], cover_image_url: null });
              setImagePreview(null);
              setError(null);
            }
          }}
        >
          <div
            className="rounded-2xl shadow-2xl p-8 w-full max-w-md border transition-colors"
            style={{
              backgroundColor: 'var(--bg-modal)',
              borderColor: 'var(--border-subtle)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-semibold mb-2 transition-colors" style={{ color: 'var(--text-primary)' }}>Create New Project</h3>
                <p className="text-sm transition-colors" style={{ color: 'var(--text-muted)' }}>Start a new focus area for your work.</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowTemplates(!showTemplates)}
              >
                {showTemplates ? 'Hide' : 'Use'} Templates
              </Button>
            </div>
            
            {showTemplates && templates.length > 0 && (
              <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <label className="block text-sm font-medium text-black mb-2">Start from Template</label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => handleApplyTemplate(template.id)}
                      className="p-3 text-left border border-gray-300 rounded-lg hover:border-black hover:bg-white transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{template.icon || '📋'}</span>
                        <span className="text-sm font-medium text-black truncate">{template.name}</span>
                      </div>
                      {template.description && (
                        <p className="text-xs text-gray-600 line-clamp-2">{template.description}</p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
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

              <div className="mb-4">
                <label className="block text-sm font-medium text-black mb-2">Cover Image (optional)</label>
                <div className="space-y-3">
                  {imagePreview ? (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-48 object-cover rounded-xl border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setNewProject({ ...newProject, cover_image_url: null });
                        }}
                        className="absolute top-2 right-2 p-2 bg-black/70 text-white rounded-lg hover:bg-black/90 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-gray-400 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm text-gray-500">Click to upload image</p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 5MB</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setUploadingImage(true);
                            try {
                              const formData = new FormData();
                              formData.append('image', file);
                              
                              const response = await fetch('/api/upload/image', {
                                method: 'POST',
                                credentials: 'include',
                                body: formData,
                              });
                              
                              if (response.ok) {
                                const data = await response.json();
                                setNewProject({ ...newProject, cover_image_url: data.url });
                                setImagePreview(data.url);
                              } else {
                                alert('Failed to upload image');
                              }
                            } catch (error) {
                              console.error('Upload error:', error);
                              alert('Failed to upload image');
                            } finally {
                              setUploadingImage(false);
                            }
                          }
                        }}
                        disabled={uploadingImage}
                      />
                    </label>
                  )}
                  {uploadingImage && (
                    <div className="text-center text-sm text-gray-500">
                      Uploading image...
                    </div>
                  )}
                </div>
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
                    setNewProject({ name: '', description: '', start_date: new Date().toISOString().split('T')[0], color: '#000000', icon: '📋', tags: [], cover_image_url: null });
                    setImagePreview(null);
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

      {/* Edit Project Modal */}
      {editingProject && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => {
            setEditingProject(null);
            setEditProjectData({});
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-2xl font-semibold text-black mb-2">Edit Project</h3>
            <p className="text-sm text-gray-600 mb-6">Update project details.</p>
            
            <form onSubmit={handleUpdateProject}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-black mb-2">Project Name</label>
                <input
                  type="text"
                  value={editProjectData.name}
                  onChange={(e) => setEditProjectData({ ...editProjectData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-black"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-black mb-2">Description</label>
                <textarea
                  value={editProjectData.description || ''}
                  onChange={(e) => setEditProjectData({ ...editProjectData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-black resize-none"
                  rows={3}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-black mb-2">Start Date</label>
                <input
                  type="date"
                  value={editProjectData.start_date}
                  onChange={(e) => setEditProjectData({ ...editProjectData, start_date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-black"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-black mb-2">Color</label>
                <input
                  type="color"
                  value={editProjectData.color}
                  onChange={(e) => setEditProjectData({ ...editProjectData, color: e.target.value })}
                  className="w-full h-12 border border-gray-300 rounded-xl"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-black mb-2">Icon</label>
                <div className="grid grid-cols-10 gap-2">
                  {iconOptions.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setEditProjectData({ ...editProjectData, icon })}
                      className={`p-2 text-xl rounded-lg border-2 transition-colors ${
                        editProjectData.icon === icon ? 'border-black bg-gray-100' : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-black mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={editProjectData.tags?.join(', ') || ''}
                  onChange={(e) => setEditProjectData({ 
                    ...editProjectData, 
                    tags: e.target.value.split(',').map(t => t.trim()).filter(t => t) 
                  })}
                  placeholder="e.g., work, personal, urgent"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-black"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-900 transition-colors font-medium"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingProject(null);
                    setEditProjectData({});
                  }}
                  className="px-6 py-3 bg-white border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Health Modal */}
      {showHealthModal && healthData && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowHealthModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-2xl font-semibold text-black mb-2">Project Health</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Health Score</span>
                  <span className={`text-lg font-semibold ${
                    healthData.status === 'healthy' ? 'text-green-600' :
                    healthData.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {healthData.score}/100
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      healthData.status === 'healthy' ? 'bg-green-600' :
                      healthData.status === 'warning' ? 'bg-yellow-600' : 'bg-red-600'
                    }`}
                    style={{ width: `${healthData.score}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Total Tasks</p>
                  <p className="text-xl font-semibold text-black">{healthData.tasks.total}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Completed</p>
                  <p className="text-xl font-semibold text-green-600">{healthData.tasks.completed}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">In Progress</p>
                  <p className="text-xl font-semibold text-blue-600">{healthData.tasks.in_progress}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Overdue</p>
                  <p className="text-xl font-semibold text-red-600">{healthData.tasks.overdue}</p>
                </div>
              </div>
              <div className="pt-4 border-t">
                <p className="text-xs text-gray-600 mb-2">Time Tracking</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Estimated: {Math.round(healthData.time.estimated_minutes / 60)}h</span>
                  <span className="text-sm text-gray-600">Spent: {Math.round(healthData.time.spent_minutes / 60)}h</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowHealthModal(false)}
              className="mt-6 w-full px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-900 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Activity Modal */}
      {showActivityModal && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowActivityModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-2xl font-semibold text-black mb-2">Recent Activity</h3>
            <div className="space-y-3 mt-4">
              {activityData.length === 0 ? (
                <p className="text-sm text-gray-600 text-center py-8">No activity yet</p>
              ) : (
                activityData.map((activity) => (
                  <div key={activity.id} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-black">{activity.description || activity.action_type}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.created_at).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
            <button
              onClick={() => setShowActivityModal(false)}
              className="mt-6 w-full px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-900 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Properties Drawer */}
      <PropertiesDrawer
        isOpen={showPropertiesDrawer}
        onClose={() => {
          setShowPropertiesDrawer(false);
          setSelectedProject(null);
        }}
        title={selectedProject?.name || 'Project Properties'}
        sections={selectedProject ? [
          {
            title: 'Details',
            fields: [
              {
                key: 'name',
                label: 'Name',
                value: selectedProject.name,
                readOnly: false,
                onChange: (value) => {
                  // Could implement inline edit here if needed
                }
              },
              {
                key: 'description',
                label: 'Description',
                value: selectedProject.description || 'Not available',
                readOnly: true
              },
              {
                key: 'progress',
                label: 'Progress',
                value: `${selectedProject.progress || 0}%`,
                readOnly: true
              },
              {
                key: 'status',
                label: 'Status',
                value: selectedProject.archived_at ? 'Archived' : 'Active',
                readOnly: true
              }
            ]
          },
          {
            title: 'Metadata',
            fields: [
              {
                key: 'start_date',
                label: 'Start Date',
                value: selectedProject.start_date ? new Date(selectedProject.start_date).toLocaleDateString() : 'Not available',
                readOnly: true
              },
              {
                key: 'tags',
                label: 'Tags',
                value: selectedProject.tags?.join(', ') || 'Not available',
                readOnly: true
              },
              {
                key: 'updated_at',
                label: 'Last Updated',
                value: selectedProject.updated_at ? new Date(selectedProject.updated_at).toLocaleString() : 'Not available',
                readOnly: true
              }
            ]
          }
        ] : []}
      />
    </Page>
  );
}
