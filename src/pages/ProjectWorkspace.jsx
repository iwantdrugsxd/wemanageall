import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import WorkspaceLayout from '../components/project-workspace/WorkspaceLayout';

export default function ProjectWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [phases, setPhases] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [activeSection, setActiveSection] = useState('overview'); // overview, tasks, notes, activity, files
  const [activeView, setActiveView] = useState('board'); // list, board, timeline, notes (for backward compatibility)

  // Direct view management (no section mapping needed)
  const handleViewChange = (view) => {
    setActiveView(view);
  };

  const handleEdit = () => {
    // TODO: Implement edit project modal
    alert('Edit project - to be implemented');
  };

  const handleArchive = () => {
    if (confirm('Archive this project?')) {
      // TODO: Implement archive
      alert('Archive project - to be implemented');
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };
  const [loading, setLoading] = useState(true);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'todo',
    due_date: ''
  });
  const [editingTask, setEditingTask] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);
  const [timelineScale, setTimelineScale] = useState('months'); // weeks, months, quarter
  const [currentNote, setCurrentNote] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);
  const [shareCode, setShareCode] = useState(null);
  const [collaborators, setCollaborators] = useState([]);
  const [userRole, setUserRole] = useState('owner');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCollaborators, setShowCollaborators] = useState(false);
  const [editingTaskData, setEditingTaskData] = useState(null);
  const [taskDependencies, setTaskDependencies] = useState({});
  const [showPhaseModal, setShowPhaseModal] = useState(false);
  const [editingPhase, setEditingPhase] = useState(null);
  const [newPhase, setNewPhase] = useState({ name: '', description: '' });
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [newMilestone, setNewMilestone] = useState({ name: '', description: '', milestone_date: '', phase_id: '' });
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [activeTimeTracking, setActiveTimeTracking] = useState(null);
  const [timeEntries, setTimeEntries] = useState({});
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [taskStatusFilter, setTaskStatusFilter] = useState('all');
  const [taskPhaseFilter, setTaskPhaseFilter] = useState('all');
  const [taskPriorityFilter, setTaskPriorityFilter] = useState('all');
  const [selectedDependencyTaskId, setSelectedDependencyTaskId] = useState('');
  const todayMarkerRef = useRef(null);

  useEffect(() => {
    if (id) {
      fetchProjectData();
    }
  }, [id]);

  const fetchProjectData = async () => {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setProject(data.project);
        setTasks(data.tasks || []);
        setNotes(data.notes || []);
        setPhases(data.phases || []);
        setMilestones(data.milestones || []);
        setShareCode(data.share_code);
        setCollaborators(data.collaborators || []);
        setUserRole(data.project?.user_role || 'owner');
      } else if (response.status === 404 || response.status === 403) {
        navigate('/projects');
      }
    } catch (error) {
      console.error('Failed to fetch project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/projects/${id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newTask),
      });
      
      if (response.ok) {
        setShowAddTask(false);
        setNewTask({ title: '', description: '', status: 'todo', due_date: '' });
        await fetchProjectData();
      }
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      const response = await fetch(`/api/projects/${id}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        await fetchProjectData();
      }
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      const response = await fetch(`/api/projects/${id}/tasks/${taskId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (response.ok) {
        await fetchProjectData();
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleUpdateTaskDate = async (taskId, newDate) => {
    try {
      const response = await fetch(`/api/projects/${id}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ due_date: newDate }),
      });
      
      if (response.ok) {
        await fetchProjectData();
      }
    } catch (error) {
      console.error('Failed to update task date:', error);
    }
  };

  const handleSaveNote = async () => {
    if (!currentNote.trim()) return;
    
    setSavingNote(true);
    try {
      const noteId = notes.length > 0 ? notes[0].id : null;
      const response = await fetch(`/api/projects/${id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: noteTitle || null,
          content: currentNote,
          note_id: noteId
        }),
      });
      
      if (response.ok) {
        setNoteSaved(true);
        setTimeout(() => setNoteSaved(false), 2000);
        await fetchProjectData();
      }
    } catch (error) {
      console.error('Failed to save note:', error);
    } finally {
      setSavingNote(false);
    }
  };

  // Auto-save note with debounce
  useEffect(() => {
    if (activeView === 'notes' && currentNote.trim()) {
      const timer = setTimeout(() => {
        handleSaveNote();
      }, 2000); // Auto-save after 2 seconds of inactivity
      
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentNote, noteTitle, activeView]);

  // Load existing note when switching to notes view
  useEffect(() => {
    if (activeView === 'notes' && notes.length > 0 && !currentNote) {
      setCurrentNote(notes[0].content);
      setNoteTitle(notes[0].title || '');
    }
  }, [activeView, notes]);

  const handleDragStart = (task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== targetStatus) {
      await handleUpdateTaskStatus(draggedTask.id, targetStatus);
    }
    setDraggedTask(null);
  };

  const handleEditTask = (task) => {
    setEditingTaskData({
      ...task,
      phase_id: task.phase_id || '',
      priority: task.priority || 'medium',
      time_estimate: task.time_estimate ? task.time_estimate / 60 : '', // Convert minutes to hours
      time_spent: task.time_spent ? task.time_spent / 60 : 0 // Convert minutes to hours
    });
    fetchTaskDependencies(task.id);
    fetchTimeEntries(task.id);
  };

  const handleUpdateTask = async () => {
    if (!editingTaskData) return;
    
    try {
      // Convert hours to minutes for backend
      const taskData = {
        ...editingTaskData,
        time_estimate: editingTaskData.time_estimate ? Math.round(editingTaskData.time_estimate * 60) : null,
        time_spent: editingTaskData.time_spent ? Math.round(editingTaskData.time_spent * 60) : 0
      };
      
      const response = await fetch(`/api/projects/${id}/tasks/${editingTaskData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(taskData),
      });
      
      if (response.ok) {
        setEditingTaskData(null);
        await fetchProjectData();
      }
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const fetchTaskDependencies = async (taskId) => {
    try {
      const response = await fetch(`/api/projects/${id}/tasks/${taskId}/dependencies`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setTaskDependencies(prev => ({ ...prev, [taskId]: data.dependencies || [] }));
      }
    } catch (error) {
      console.error('Failed to fetch dependencies:', error);
    }
  };

  const handleAddDependency = async (taskId, dependsOnTaskId) => {
    try {
      const response = await fetch(`/api/projects/${id}/tasks/${taskId}/dependencies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ depends_on_task_id: dependsOnTaskId }),
      });
      
      if (response.ok) {
        await fetchTaskDependencies(taskId);
      }
    } catch (error) {
      console.error('Failed to add dependency:', error);
    }
  };

  const handleRemoveDependency = async (taskId, depId) => {
    try {
      const response = await fetch(`/api/projects/${id}/tasks/${taskId}/dependencies/${depId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (response.ok) {
        await fetchTaskDependencies(taskId);
      }
    } catch (error) {
      console.error('Failed to remove dependency:', error);
    }
  };

  const handleCreatePhase = async () => {
    if (!newPhase.name.trim()) return;
    
    try {
      const response = await fetch(`/api/projects/${id}/phases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newPhase),
      });
      
      if (response.ok) {
        setShowPhaseModal(false);
        setNewPhase({ name: '', description: '' });
        await fetchProjectData();
      }
    } catch (error) {
      console.error('Failed to create phase:', error);
    }
  };

  const handleUpdatePhase = async () => {
    if (!editingPhase || !editingPhase.name.trim()) return;
    
    try {
      const response = await fetch(`/api/projects/${id}/phases/${editingPhase.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editingPhase),
      });
      
      if (response.ok) {
        setEditingPhase(null);
        await fetchProjectData();
      }
    } catch (error) {
      console.error('Failed to update phase:', error);
    }
  };

  const handleDeletePhase = async (phaseId) => {
    if (!confirm('Delete this phase? Tasks in this phase will be unassigned.')) return;
    
    try {
      const response = await fetch(`/api/projects/${id}/phases/${phaseId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (response.ok) {
        await fetchProjectData();
      }
    } catch (error) {
      console.error('Failed to delete phase:', error);
    }
  };

  const handleCreateMilestone = async () => {
    if (!newMilestone.name.trim() || !newMilestone.milestone_date) return;
    
    try {
      const response = await fetch(`/api/projects/${id}/milestones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newMilestone),
      });
      
      if (response.ok) {
        setShowMilestoneModal(false);
        setNewMilestone({ name: '', description: '', milestone_date: '', phase_id: '' });
        await fetchProjectData();
      }
    } catch (error) {
      console.error('Failed to create milestone:', error);
    }
  };

  const handleUpdateMilestone = async () => {
    if (!editingMilestone || !editingMilestone.name.trim()) return;
    
    try {
      const response = await fetch(`/api/projects/${id}/milestones/${editingMilestone.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editingMilestone),
      });
      
      if (response.ok) {
        setEditingMilestone(null);
        await fetchProjectData();
      }
    } catch (error) {
      console.error('Failed to update milestone:', error);
    }
  };

  const handleDeleteMilestone = async (milestoneId) => {
    if (!confirm('Delete this milestone?')) return;
    
    try {
      const response = await fetch(`/api/projects/${id}/milestones/${milestoneId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (response.ok) {
        await fetchProjectData();
      }
    } catch (error) {
      console.error('Failed to delete milestone:', error);
    }
  };

  const handleCreateNote = async () => {
    if (!newNote.content.trim()) return;
    
    try {
      const response = await fetch(`/api/projects/${id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newNote),
      });
      
      if (response.ok) {
        setNewNote({ title: '', content: '' });
        await fetchProjectData();
      }
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  };

  const handleUpdateNote = async (noteId, noteData) => {
    try {
      const response = await fetch(`/api/projects/${id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...noteData, note_id: noteId }),
      });
      
      if (response.ok) {
        setEditingNoteId(null);
        await fetchProjectData();
      }
    } catch (error) {
      console.error('Failed to update note:', error);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!confirm('Delete this note?')) return;
    
    try {
      const response = await fetch(`/api/projects/${id}/notes/${noteId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (response.ok) {
        await fetchProjectData();
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const handleStartTimeTracking = async (taskId) => {
    try {
      const response = await fetch(`/api/projects/${id}/tasks/${taskId}/time/start`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        setActiveTimeTracking(taskId);
        await fetchTimeEntries(taskId);
      }
    } catch (error) {
      console.error('Failed to start time tracking:', error);
    }
  };

  const handleStopTimeTracking = async (taskId) => {
    try {
      const response = await fetch(`/api/projects/${id}/tasks/${taskId}/time/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ notes: '' }),
      });
      
      if (response.ok) {
        setActiveTimeTracking(null);
        await fetchTimeEntries(taskId);
        await fetchProjectData();
      }
    } catch (error) {
      console.error('Failed to stop time tracking:', error);
    }
  };

  const fetchTimeEntries = async (taskId) => {
    try {
      const response = await fetch(`/api/projects/${id}/tasks/${taskId}/time`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setTimeEntries(prev => ({ ...prev, [taskId]: data.timeEntries || [] }));
      }
    } catch (error) {
      console.error('Failed to fetch time entries:', error);
    }
  };

  const handleUpdateCollaboratorRole = async (userId, role) => {
    try {
      const response = await fetch(`/api/projects/${id}/collaborators/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role }),
      });
      
      if (response.ok) {
        await fetchProjectData();
      }
    } catch (error) {
      console.error('Failed to update collaborator role:', error);
    }
  };

  const handleRemoveCollaborator = async (userId) => {
    if (!confirm('Remove this collaborator?')) return;
    
    try {
      const response = await fetch(`/api/projects/${id}/collaborators/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (response.ok) {
        await fetchProjectData();
      }
    } catch (error) {
      console.error('Failed to remove collaborator:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 text-center">
        <div className="text-[var(--text-secondary)]">Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  // Apply filters
  const filteredTasks = tasks.filter(task => {
    if (taskStatusFilter !== 'all' && task.status !== taskStatusFilter) return false;
    if (taskPhaseFilter !== 'all' && task.phase_id !== parseInt(taskPhaseFilter)) return false;
    if (taskPriorityFilter !== 'all' && task.priority !== taskPriorityFilter) return false;
    return true;
  });

  const tasksByStatus = {
    todo: filteredTasks.filter(t => t.status === 'todo'),
    in_progress: filteredTasks.filter(t => t.status === 'in_progress'),
    done: filteredTasks.filter(t => t.status === 'done'),
  };

  return (
    <div className="max-w-full mx-auto h-screen flex flex-col">
      <WorkspaceLayout
        project={project}
        userRole={userRole}
        activeView={activeView}
        onViewChange={handleViewChange}
        collaboratorsCount={collaborators.length}
        onShare={handleShare}
        onToggleCollaborators={() => setShowCollaborators(!showCollaborators)}
        onAddTask={() => setShowAddTask(true)}
        onFilter={() => setShowFilterPanel(!showFilterPanel)}
        onManagePhases={() => setShowPhaseModal(true)}
      >
      {/* Board View */}
      {activeView === 'board' && (
        <div className="grid grid-cols-3 gap-6">
          {['todo', 'in_progress', 'done'].map((status) => (
            <div
              key={status}
              className="bg-[var(--bg-surface)]/30 rounded-xl p-4"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, status)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-sm font-semibold text-[var(--text-primary)] uppercase">
                  {status === 'todo' ? 'TO DO' : status === 'in_progress' ? 'IN PROGRESS' : 'DONE'}
                  <span className="ml-2 text-[var(--text-muted)] font-normal">
                    ({tasksByStatus[status].length})
                  </span>
                </h3>
                <button className="text-[var(--text-primary)] hover:text-[var(--text-primary)] text-lg">+</button>
              </div>
              
              <div className="space-y-3">
                {tasksByStatus[status].map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task)}
                    className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--border-subtle)] cursor-move hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-[var(--text-primary)] text-sm mb-1">{task.title}</h4>
                        {task.description && (
                          <p className="text-xs text-[var(--text-muted)] line-clamp-2">{task.description}</p>
                        )}
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        <button
                          onClick={() => handleEditTask(task)}
                          className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        {task.due_date && (
                          <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formatDate(task.due_date)}
                          </div>
                        )}
                        {(taskDependencies[task.id]?.length || 0) > 0 && (
                          <span className="text-xs text-[var(--text-muted)]">
                            {(taskDependencies[task.id]?.length || 0)} deps
                          </span>
                        )}
                      </div>
                      <div>
                        {activeTimeTracking === task.id ? (
                          <button
                            onClick={() => handleStopTimeTracking(task.id)}
                            className="px-2 py-1 text-xs bg-[var(--error)] text-white rounded hover:bg-red-700 transition-colors"
                          >
                            Stop
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStartTimeTracking(task.id)}
                            className="px-2 py-1 text-xs bg-[var(--accent)] text-white rounded hover:bg-[var(--accent-hover)] transition-colors"
                          >
                            Start
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {activeView === 'list' && activeSection === 'tasks' && (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--border-subtle)] hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={task.status === 'done'}
                  onChange={(e) => handleUpdateTaskStatus(task.id, e.target.checked ? 'done' : 'todo')}
                  className="w-5 h-5 rounded border-[var(--border-subtle)] text-[var(--text-primary)] focus:ring-[var(--accent)]"
                />
                <div className="flex-1">
                  <h4 className={`font-medium text-[var(--text-primary)] ${task.status === 'done' ? 'line-through text-[var(--text-muted)]' : ''}`}>
                    {task.title}
                  </h4>
                  {task.description && (
                    <p className="text-sm text-[var(--text-muted)] mt-1">{task.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {task.due_date && (
                    <span className="text-xs text-[var(--text-muted)]">{formatDate(task.due_date)}</span>
                  )}
                  {(taskDependencies[task.id]?.length || 0) > 0 && (
                    <span className="text-xs text-[var(--text-muted)]">
                      {(taskDependencies[task.id]?.length || 0)} deps
                    </span>
                  )}
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    task.status === 'done' ? 'bg-[var(--border-subtle)] text-[var(--text-primary)]' :
                    task.status === 'in_progress' ? 'bg-[var(--border-subtle)] text-[var(--text-primary)]' :
                    'bg-[var(--border-subtle)] text-[var(--text-primary)]'
                  }`}>
                    {task.status === 'done' ? 'Done' : task.status === 'in_progress' ? 'In Progress' : 'To Do'}
                  </span>
                  {activeTimeTracking === task.id ? (
                    <button
                      onClick={() => handleStopTimeTracking(task.id)}
                      className="px-2 py-1 text-xs bg-[var(--error)] text-white rounded hover:bg-red-700 transition-colors"
                    >
                      Stop
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStartTimeTracking(task.id)}
                      className="px-2 py-1 text-xs bg-[var(--accent)] text-white rounded hover:bg-[var(--accent-hover)] transition-colors"
                    >
                      Start
                    </button>
                  )}
                  <button
                    onClick={() => handleEditTask(task)}
                    className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Edit task"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Timeline View */}
      {activeView === 'timeline' && (
        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)]">
          <div className="p-6 border-b border-[var(--border-subtle)] flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold text-[var(--text-primary)]">Timeline</h3>
            <div className="flex items-center gap-2">
              {['weeks', 'months', 'quarter'].map((scale) => (
                <button
                  key={scale}
                  onClick={() => setTimelineScale(scale)}
                  className={`px-3 py-1 rounded-lg text-sm capitalize ${
                    timelineScale === scale
                      ? 'bg-[var(--accent)] text-white'
                      : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--border-subtle)]'
                  }`}
                >
                  {scale}
                </button>
              ))}
              <button
                onClick={() => {
                  const today = new Date().toISOString().split('T')[0];
                  // Scroll to today in timeline
                }}
                className="ml-4 px-4 py-2 bg-[var(--accent)] text-white rounded-xl hover:bg-[var(--accent-hover)] transition-colors flex items-center gap-2 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Go to Today
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {/* Left Panel - Tasks & Milestones */}
            <div className="grid grid-cols-4 gap-6">
              <div className="col-span-1">
                <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-4 uppercase">Tasks & Milestones</h4>
                <div className="space-y-4">
                  {phases.map((phase) => (
                    <div key={phase.id} className="mb-6">
                      <h5 className="text-xs font-semibold text-[var(--text-primary)] mb-2 uppercase">{phase.name}</h5>
                  <div className="space-y-2">
                    {filteredTasks
                      .filter(t => t.phase_id === phase.id)
                      .map((task) => (
                            <div key={task.id} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                              <div className="w-2 h-2 rounded-full bg-[var(--accent)]"></div>
                              <span>{task.title}</span>
                            </div>
                          ))}
                      </div>
                      {milestones
                        .filter(m => m.phase_id === phase.id)
                        .map((milestone) => (
                          <div key={milestone.id} className="flex items-center gap-2 text-sm text-[var(--text-primary)] mt-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                            </svg>
                            <span>{milestone.name}</span>
                          </div>
                        ))}
                    </div>
                  ))}
                  
                  {filteredTasks.filter(t => !t.phase_id).length > 0 && (
                    <div>
                      <h5 className="text-xs font-semibold text-[var(--text-primary)] mb-2 uppercase">Unassigned</h5>
                      <div className="space-y-2">
                        {filteredTasks
                          .filter(t => !t.phase_id)
                          .map((task) => (
                            <div key={task.id} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                              <div className="w-2 h-2 rounded-full bg-[var(--accent)]"></div>
                              <span>{task.title}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Right Panel - Timeline Grid */}
              <div className="col-span-3">
                <div className="bg-[var(--bg-surface)]/30 rounded-xl p-4 overflow-x-auto">
                  <div className="grid grid-cols-5 gap-2 mb-4 min-w-max relative">
                    {['Oct Week 1', 'Oct Week 2', 'Oct Week 3', 'Oct Week 4', 'Nov Week 1'].map((week, index) => {
                      const today = new Date();
                      const weekStart = new Date('2024-10-01');
                      weekStart.setDate(weekStart.getDate() + index * 7);
                      const weekEnd = new Date(weekStart);
                      weekEnd.setDate(weekEnd.getDate() + 6);
                      const isTodayWeek = today >= weekStart && today <= weekEnd;
                      
                      return (
                        <div key={week} className="text-xs text-[var(--text-muted)] text-center font-medium relative">
                          {week}
                          {isTodayWeek && (
                            <div
                              ref={todayMarkerRef}
                              className="absolute left-1/2 top-full mt-2 w-0.5 h-8 bg-red-500 transform -translate-x-1/2 z-10"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="space-y-2">
                    {filteredTasks.map((task) => {
                      if (!task.due_date) return null;
                      const taskDate = new Date(task.due_date);
                      const weekIndex = Math.floor((taskDate - new Date('2024-10-01')) / (7 * 24 * 60 * 60 * 1000));
                      
                      return (
                        <div key={task.id} className="relative h-8">
                          <div
                            className="absolute bg-black/80 rounded px-2 py-1 text-xs text-white flex items-center"
                            style={{
                              left: `${Math.max(0, Math.min(4, weekIndex)) * 20}%`,
                              width: '15%'
                            }}
                          >
                            {task.title}
                          </div>
                        </div>
                      );
                    })}
                    
                    {milestones.map((milestone) => {
                      const milestoneDate = new Date(milestone.milestone_date);
                      const weekIndex = Math.floor((milestoneDate - new Date('2024-10-01')) / (7 * 24 * 60 * 60 * 1000));
                      
                      return (
                        <div key={milestone.id} className="relative h-8">
                          <div
                            className="absolute left-0 flex items-center"
                            style={{ left: `${Math.max(0, Math.min(4, weekIndex)) * 20}%` }}
                          >
                            <svg className="w-6 h-6 text-[var(--text-primary)]" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                            </svg>
                            <span className="ml-2 text-xs text-[var(--text-primary)] font-medium">{milestone.name}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notes View */}
      {activeView === 'notes' && (
        <div className="space-y-4">
          <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-semibold text-[var(--text-primary)]">Project Notes</h3>
              <button
                onClick={() => {
                  setNewNote({ title: '', content: '' });
                  setEditingNoteId(null);
                }}
                className="px-4 py-2 bg-[var(--accent)] text-white rounded-xl hover:bg-[var(--accent-hover)] transition-colors text-sm"
              >
                + New Note
              </button>
            </div>
            
            {/* New/Edit Note Form */}
            {(editingNoteId || (!editingNoteId && (newNote.title || newNote.content))) && (
              <div className="mb-6 p-4 bg-[var(--bg-surface)] rounded-lg">
                <input
                  type="text"
                  value={editingNoteId ? notes.find(n => n.id === editingNoteId)?.title || '' : newNote.title}
                  onChange={(e) => {
                    if (editingNoteId) {
                      const note = notes.find(n => n.id === editingNoteId);
                      handleUpdateNote(editingNoteId, { ...note, title: e.target.value });
                    } else {
                      setNewNote({ ...newNote, title: e.target.value });
                    }
                  }}
                  placeholder="Note title (optional)"
                  className="w-full px-3 py-2 mb-2 border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:border-[var(--accent)] text-sm"
                />
                <textarea
                  value={editingNoteId ? notes.find(n => n.id === editingNoteId)?.content || '' : newNote.content}
                  onChange={(e) => {
                    if (editingNoteId) {
                      const note = notes.find(n => n.id === editingNoteId);
                      handleUpdateNote(editingNoteId, { ...note, content: e.target.value });
                    } else {
                      setNewNote({ ...newNote, content: e.target.value });
                    }
                  }}
                  placeholder="Start writing your thoughts here..."
                  className="w-full min-h-[200px] px-3 py-2 border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:border-[var(--accent)] resize-none text-sm"
                />
                <div className="flex gap-2 mt-2">
                  {!editingNoteId && (
                    <button
                      onClick={handleCreateNote}
                      disabled={!newNote.content.trim()}
                      className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 text-sm"
                    >
                      Save Note
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setNewNote({ title: '', content: '' });
                      setEditingNoteId(null);
                    }}
                    className="px-4 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] rounded-lg hover:bg-[var(--bg-surface)] transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            
            {/* Notes List */}
            <div className="space-y-3">
              {notes.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)] text-center py-8">No notes yet. Create your first note above.</p>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className="p-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg hover:shadow-md transition-all">
                    {editingNoteId === note.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={note.title || ''}
                          onChange={(e) => handleUpdateNote(note.id, { ...note, title: e.target.value })}
                          className="w-full px-3 py-2 border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:border-[var(--accent)] text-sm font-medium"
                        />
                        <textarea
                          value={note.content}
                          onChange={(e) => handleUpdateNote(note.id, { ...note, content: e.target.value })}
                          className="w-full min-h-[150px] px-3 py-2 border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:border-[var(--accent)] resize-none text-sm"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingNoteId(null)}
                            className="px-3 py-1.5 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)] transition-colors text-xs"
                          >
                            Done
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            {note.title && (
                              <h4 className="font-medium text-[var(--text-primary)] mb-1">{note.title}</h4>
                            )}
                            <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">{note.content}</p>
                            <p className="text-xs text-[var(--text-muted)] mt-2">
                              {new Date(note.updated_at || note.created_at).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setEditingNoteId(note.id)}
                              className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                              title="Edit note"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteNote(note.id)}
                              className="p-1.5 text-[var(--text-muted)] hover:text-[var(--error)] transition-colors"
                              title="Delete note"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
            
            {/* Formatting Toolbar (appears on focus) */}
            <div className="mt-4 flex items-center gap-2 p-2 bg-[var(--bg-surface)] rounded-lg">
              <button className="p-2 hover:bg-[var(--bg-card)] rounded" title="Bold">
                <span className="font-bold text-sm">B</span>
              </button>
              <button className="p-2 hover:bg-[var(--bg-card)] rounded" title="Italic">
                <span className="italic text-sm">I</span>
              </button>
              <button className="p-2 hover:bg-[var(--bg-card)] rounded" title="Underline">
                <span className="underline text-sm">U</span>
              </button>
              <div className="w-px h-6 bg-[var(--border-subtle)] mx-1"></div>
              <button className="p-2 hover:bg-[var(--bg-card)] rounded" title="Bullet List">
                <span className="text-sm">•</span>
              </button>
              <button className="p-2 hover:bg-[var(--bg-card)] rounded" title="Numbered List">
                <span className="text-sm">1.</span>
              </button>
              <button className="p-2 hover:bg-[var(--bg-card)] rounded" title="Checkbox List">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <div className="w-px h-6 bg-[var(--border-subtle)] mx-1"></div>
              <button className="p-2 hover:bg-[var(--bg-card)] rounded" title="Image">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
              <button className="p-2 hover:bg-[var(--bg-card)] rounded" title="Link">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </button>
              <div className="flex-1"></div>
              <button className="px-3 py-1 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)] transition-colors flex items-center gap-1 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                AI Refine
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className="bg-[var(--bg-card)] rounded-2xl shadow-2xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-lg font-semibold text-[var(--text-primary)] mb-4">Add Task</h3>
            <form onSubmit={handleCreateTask}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Task Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="e.g., Define North Star Metrics"
                  className="w-full px-4 py-2 border border-[var(--border-subtle)] rounded-xl focus:outline-none focus:border-[var(--accent)]"
                  required
                  autoFocus
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Description (optional)</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Add details..."
                  className="w-full px-4 py-2 border border-[var(--border-subtle)] rounded-xl focus:outline-none focus:border-[var(--accent)] resize-none"
                  rows={3}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Status</label>
                <select
                  value={newTask.status}
                  onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                  className="w-full px-4 py-2 border border-[var(--border-subtle)] rounded-xl focus:outline-none focus:border-[var(--accent)]"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Due Date (optional)</label>
                <input
                  type="date"
                  value={newTask.due_date}
                  onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                  className="w-full px-4 py-2 border border-[var(--border-subtle)] rounded-xl focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-6 py-2 bg-[var(--accent)] text-white rounded-xl hover:bg-[var(--accent-hover)] transition-colors"
                >
                  Add Task
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddTask(false);
                    setNewTask({ title: '', description: '', status: 'todo', due_date: '' });
                  }}
                  className="px-6 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] rounded-xl hover:bg-[var(--bg-surface)] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTaskData && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className="bg-[var(--bg-card)] rounded-2xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-lg font-semibold text-[var(--text-primary)] mb-4">Edit Task</h3>
            <form onSubmit={(e) => { e.preventDefault(); handleUpdateTask(); }}>
              <div className="space-y-4">
                {/* Task Title */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Task Title</label>
                  <input
                    type="text"
                    value={editingTaskData.title || ''}
                    onChange={(e) => setEditingTaskData({ ...editingTaskData, title: e.target.value })}
                    placeholder="e.g., Define North Star Metrics"
                    className="w-full px-4 py-2 border border-[var(--border-subtle)] rounded-xl focus:outline-none focus:border-[var(--accent)]"
                    required
                    autoFocus
                  />
                </div>
                
                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Description (optional)</label>
                  <textarea
                    value={editingTaskData.description || ''}
                    onChange={(e) => setEditingTaskData({ ...editingTaskData, description: e.target.value })}
                    placeholder="Add details..."
                    className="w-full px-4 py-2 border border-[var(--border-subtle)] rounded-xl focus:outline-none focus:border-[var(--accent)] resize-none"
                    rows={3}
                  />
                </div>
                
                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Status</label>
                  <select
                    value={editingTaskData.status || 'todo'}
                    onChange={(e) => setEditingTaskData({ ...editingTaskData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-[var(--border-subtle)] rounded-xl focus:outline-none focus:border-[var(--accent)]"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                
                {/* Due Date */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Due Date (optional)</label>
                  <input
                    type="date"
                    value={editingTaskData.due_date || ''}
                    onChange={(e) => setEditingTaskData({ ...editingTaskData, due_date: e.target.value })}
                    className="w-full px-4 py-2 border border-[var(--border-subtle)] rounded-xl focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
                
                {/* Phase */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Phase</label>
                  <select
                    value={editingTaskData.phase_id || ''}
                    onChange={(e) => setEditingTaskData({ ...editingTaskData, phase_id: e.target.value || null })}
                    className="w-full px-4 py-2 border border-[var(--border-subtle)] rounded-xl focus:outline-none focus:border-[var(--accent)]"
                  >
                    <option value="">Unassigned</option>
                    {phases.map((phase) => (
                      <option key={phase.id} value={phase.id}>{phase.name}</option>
                    ))}
                  </select>
                </div>
                
                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Priority</label>
                  <select
                    value={editingTaskData.priority || 'medium'}
                    onChange={(e) => setEditingTaskData({ ...editingTaskData, priority: e.target.value })}
                    className="w-full px-4 py-2 border border-[var(--border-subtle)] rounded-xl focus:outline-none focus:border-[var(--accent)]"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                
                {/* Time Estimate */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Time Estimate (hours)</label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    value={editingTaskData.time_estimate || ''}
                    onChange={(e) => setEditingTaskData({ ...editingTaskData, time_estimate: e.target.value ? parseFloat(e.target.value) : '' })}
                    placeholder="e.g., 2.5"
                    className="w-full px-4 py-2 border border-[var(--border-subtle)] rounded-xl focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
                
                {/* Time Spent */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Time Spent (hours)</label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    value={editingTaskData.time_spent || 0}
                    onChange={(e) => setEditingTaskData({ ...editingTaskData, time_spent: e.target.value ? parseFloat(e.target.value) : 0 })}
                    placeholder="e.g., 1.5"
                    className="w-full px-4 py-2 border border-[var(--border-subtle)] rounded-xl focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
                
                {/* Dependencies Section */}
                <div className="border-t border-[var(--border-subtle)] pt-4">
                  <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Dependencies</h4>
                  <div className="mb-3">
                    <select
                      value={selectedDependencyTaskId}
                      onChange={(e) => setSelectedDependencyTaskId(e.target.value)}
                      className="w-full px-4 py-2 border border-[var(--border-subtle)] rounded-xl focus:outline-none focus:border-[var(--accent)]"
                    >
                      <option value="">Select a task...</option>
                      {tasks
                        .filter(t => t.id !== editingTaskData.id)
                        .map((task) => (
                          <option key={task.id} value={task.id}>{task.title}</option>
                        ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedDependencyTaskId) {
                          handleAddDependency(editingTaskData.id, parseInt(selectedDependencyTaskId));
                          setSelectedDependencyTaskId('');
                        }
                      }}
                      disabled={!selectedDependencyTaskId}
                      className="mt-2 px-4 py-2 bg-[var(--accent)] text-white rounded-xl hover:bg-[var(--accent-hover)] transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add Dependency
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(taskDependencies[editingTaskData.id] || []).map((dep) => {
                      const depTask = tasks.find(t => t.id === dep.depends_on_task_id);
                      return depTask ? (
                        <div key={dep.id} className="flex items-center justify-between p-2 bg-[var(--bg-surface)] rounded-lg">
                          <span className="text-sm text-[var(--text-primary)]">{depTask.title}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveDependency(editingTaskData.id, dep.id)}
                            className="text-[var(--error)] hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ) : null;
                    })}
                    {(!taskDependencies[editingTaskData.id] || taskDependencies[editingTaskData.id].length === 0) && (
                      <p className="text-sm text-[var(--text-muted)]">No dependencies</p>
                    )}
                  </div>
                </div>
                
                {/* Time Tracking Section */}
                <div className="border-t border-[var(--border-subtle)] pt-4">
                  <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Time Tracking</h4>
                  <div className="mb-3">
                    {activeTimeTracking === editingTaskData.id ? (
                      <button
                        type="button"
                        onClick={() => handleStopTimeTracking(editingTaskData.id)}
                        className="px-4 py-2 bg-[var(--error)] text-white rounded-xl hover:bg-red-700 transition-colors text-sm"
                      >
                        Stop Tracking
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleStartTimeTracking(editingTaskData.id)}
                        className="px-4 py-2 bg-[var(--accent)] text-white rounded-xl hover:bg-[var(--accent-hover)] transition-colors text-sm"
                      >
                        Start Tracking
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <h5 className="text-xs font-semibold text-[var(--text-secondary)] uppercase">Time Entries</h5>
                    {(timeEntries[editingTaskData.id] || []).length > 0 ? (
                      timeEntries[editingTaskData.id].map((entry) => {
                        const start = new Date(entry.start_time);
                        const end = entry.end_time ? new Date(entry.end_time) : null;
                        const duration = end ? Math.round((end - start) / 1000 / 60) : null;
                        return (
                          <div key={entry.id} className="p-2 bg-[var(--bg-surface)] rounded-lg text-sm">
                            <div className="flex justify-between">
                              <span className="text-[var(--text-primary)]">
                                {start.toLocaleString()} {end ? `- ${end.toLocaleString()}` : '(Active)'}
                              </span>
                              {duration && <span className="text-[var(--text-secondary)]">{duration} min</span>}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-[var(--text-muted)]">No time entries yet</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 px-6 py-2 bg-[var(--accent)] text-white rounded-xl hover:bg-[var(--accent-hover)] transition-colors"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingTaskData(null)}
                  className="px-6 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] rounded-xl hover:bg-[var(--bg-surface)] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowShareModal(false)}
        >
          <div
            className="bg-[var(--bg-card)] rounded-2xl shadow-2xl p-8 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-xl font-semibold text-[var(--text-primary)] mb-2">Share Project</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-6">Share this code with others to collaborate on this project.</p>
            
            {shareCode ? (
              <div className="mb-6">
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Share Code</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={shareCode}
                    readOnly
                    className="flex-1 px-4 py-3 border border-[var(--border-subtle)] rounded-xl bg-[var(--bg-surface)] text-center text-2xl font-mono tracking-widest"
                  />
                  <button
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(shareCode);
                        alert('Share code copied to clipboard!');
                      } catch (error) {
                        console.error('Failed to copy:', error);
                      }
                    }}
                    className="px-4 py-3 bg-[var(--accent)] text-white rounded-xl hover:bg-[var(--accent-hover)] transition-colors"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-2">Anyone with this code can join the project</p>
              </div>
            ) : (
              <div className="mb-6">
                <p className="text-sm text-[var(--text-secondary)] mb-4">No share code exists. Generate one to share this project.</p>
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch(`/api/projects/${id}/share`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ access_level: 'editor' }),
                      });
                      
                      if (response.ok) {
                        const data = await response.json();
                        setShareCode(data.share_code);
                        await fetchProjectData();
                      }
                    } catch (error) {
                      console.error('Failed to generate share code:', error);
                    }
                  }}
                  className="w-full px-4 py-3 bg-[var(--accent)] text-white rounded-xl hover:bg-[var(--accent-hover)] transition-colors"
                >
                  Generate Share Code
                </button>
              </div>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowShareModal(false)}
                className="flex-1 px-6 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] rounded-xl hover:bg-[var(--bg-surface)] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Collaborators Sidebar */}
      {showCollaborators && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-end justify-end p-4">
          <div
            className="bg-[var(--bg-card)] rounded-2xl shadow-2xl p-6 w-full max-w-sm h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-lg font-semibold text-[var(--text-primary)]">Collaborators</h3>
              <button
                onClick={() => setShowCollaborators(false)}
                className="p-2 hover:bg-[var(--bg-surface)] rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-3">
              {/* Owner */}
              <div className="flex items-center gap-3 p-3 bg-[var(--bg-surface)] rounded-xl">
                <div className="w-10 h-10 rounded-full bg-[var(--accent)] flex items-center justify-center text-white font-semibold">
                  {project?.name?.charAt(0) || 'O'}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-[var(--text-primary)]">You (Owner)</p>
                  <p className="text-xs text-[var(--text-muted)]">Project Owner</p>
                </div>
                <span className="px-2 py-1 text-xs bg-[var(--accent)] text-white rounded-full">Owner</span>
              </div>
              
              {/* Collaborators */}
              {collaborators.map((collab) => (
                <div key={collab.user_id} className="flex items-center gap-3 p-3 bg-[var(--bg-surface)] rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] font-semibold">
                    {collab.user_name?.charAt(0) || collab.user_email?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[var(--text-primary)]">{collab.user_name || collab.user_email}</p>
                    <p className="text-xs text-[var(--text-muted)]">Joined {new Date(collab.joined_at).toLocaleDateString()}</p>
                  </div>
                  {(userRole === 'owner' || userRole === 'admin') ? (
                    <div className="flex items-center gap-2">
                      <select
                        value={collab.role}
                        onChange={(e) => handleUpdateCollaboratorRole(collab.user_id, e.target.value)}
                        className="px-2 py-1 text-xs border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:border-[var(--accent)] bg-[var(--bg-card)]"
                      >
                        <option value="viewer">viewer</option>
                        <option value="editor">editor</option>
                        <option value="admin">admin</option>
                      </select>
                      <button
                        onClick={() => handleRemoveCollaborator(collab.user_id)}
                        className="p-1.5 text-[var(--error)] hover:text-red-800 transition-colors"
                        title="Remove collaborator"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      collab.role === 'admin' ? 'bg-[var(--border-subtle)] text-[var(--text-primary)]' :
                      collab.role === 'editor' ? 'bg-[var(--border-subtle)] text-[var(--text-primary)]' :
                      'bg-[var(--border-subtle)] text-[var(--text-primary)]'
                    }`}>
                      {collab.role}
                    </span>
                  )}
                </div>
              ))}
              
              {collaborators.length === 0 && (
                <p className="text-sm text-[var(--text-muted)] text-center py-8">No collaborators yet. Share the project to invite others!</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Phases Modal */}
      {showPhaseModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className="bg-[var(--bg-card)] rounded-2xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-lg font-semibold text-[var(--text-primary)]">Manage Phases</h3>
              <button
                onClick={() => {
                  setShowPhaseModal(false);
                  setEditingPhase(null);
                  setNewPhase({ name: '', description: '' });
                }}
                className="p-2 hover:bg-[var(--bg-surface)] rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Existing Phases */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Existing Phases</h4>
              <div className="space-y-2">
                {phases.map((phase) => (
                  <div key={phase.id} className="flex items-center justify-between p-3 bg-[var(--bg-surface)] rounded-lg">
                    {editingPhase?.id === phase.id ? (
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={editingPhase.name}
                          onChange={(e) => setEditingPhase({ ...editingPhase, name: e.target.value })}
                          className="w-full px-3 py-2 border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:border-[var(--accent)] text-sm"
                          placeholder="Phase name"
                        />
                        <input
                          type="text"
                          value={editingPhase.description || ''}
                          onChange={(e) => setEditingPhase({ ...editingPhase, description: e.target.value })}
                          className="w-full px-3 py-2 border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:border-[var(--accent)] text-sm"
                          placeholder="Description (optional)"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleUpdatePhase}
                            className="px-3 py-1 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)] transition-colors text-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingPhase(null)}
                            className="px-3 py-1 bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] rounded-lg hover:bg-[var(--bg-surface)] transition-colors text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1">
                          <p className="font-medium text-[var(--text-primary)]">{phase.name}</p>
                          {phase.description && (
                            <p className="text-sm text-[var(--text-muted)]">{phase.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingPhase(phase)}
                            className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeletePhase(phase.id)}
                            className="p-1.5 text-[var(--error)] hover:text-red-800 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {phases.length === 0 && (
                  <p className="text-sm text-[var(--text-muted)] text-center py-4">No phases yet. Create one below.</p>
                )}
              </div>
            </div>
            
            {/* Create Phase Form */}
            <div className="border-t border-[var(--border-subtle)] pt-4">
              <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Create New Phase</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  value={newPhase.name}
                  onChange={(e) => setNewPhase({ ...newPhase, name: e.target.value })}
                  placeholder="Phase name"
                  className="w-full px-4 py-2 border border-[var(--border-subtle)] rounded-xl focus:outline-none focus:border-[var(--accent)]"
                />
                <input
                  type="text"
                  value={newPhase.description}
                  onChange={(e) => setNewPhase({ ...newPhase, description: e.target.value })}
                  placeholder="Description (optional)"
                  className="w-full px-4 py-2 border border-[var(--border-subtle)] rounded-xl focus:outline-none focus:border-[var(--accent)]"
                />
                <button
                  onClick={handleCreatePhase}
                  disabled={!newPhase.name.trim()}
                  className="w-full px-4 py-2 bg-[var(--accent)] text-white rounded-xl hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Phase
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Milestones Modal */}
      {showMilestoneModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className="bg-[var(--bg-card)] rounded-2xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-lg font-semibold text-[var(--text-primary)]">Manage Milestones</h3>
              <button
                onClick={() => {
                  setShowMilestoneModal(false);
                  setEditingMilestone(null);
                  setNewMilestone({ name: '', description: '', milestone_date: '', phase_id: '' });
                }}
                className="p-2 hover:bg-[var(--bg-surface)] rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Existing Milestones */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Existing Milestones</h4>
              <div className="space-y-2">
                {milestones.map((milestone) => (
                  <div key={milestone.id} className="flex items-center justify-between p-3 bg-[var(--bg-surface)] rounded-lg">
                    {editingMilestone?.id === milestone.id ? (
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={editingMilestone.name}
                          onChange={(e) => setEditingMilestone({ ...editingMilestone, name: e.target.value })}
                          className="w-full px-3 py-2 border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:border-[var(--accent)] text-sm"
                          placeholder="Milestone name"
                        />
                        <input
                          type="text"
                          value={editingMilestone.description || ''}
                          onChange={(e) => setEditingMilestone({ ...editingMilestone, description: e.target.value })}
                          className="w-full px-3 py-2 border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:border-[var(--accent)] text-sm"
                          placeholder="Description (optional)"
                        />
                        <input
                          type="date"
                          value={editingMilestone.milestone_date}
                          onChange={(e) => setEditingMilestone({ ...editingMilestone, milestone_date: e.target.value })}
                          className="w-full px-3 py-2 border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:border-[var(--accent)] text-sm"
                        />
                        <select
                          value={editingMilestone.phase_id || ''}
                          onChange={(e) => setEditingMilestone({ ...editingMilestone, phase_id: e.target.value || null })}
                          className="w-full px-3 py-2 border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:border-[var(--accent)] text-sm"
                        >
                          <option value="">Unassigned</option>
                          {phases.map((phase) => (
                            <option key={phase.id} value={phase.id}>{phase.name}</option>
                          ))}
                        </select>
                        <div className="flex gap-2">
                          <button
                            onClick={handleUpdateMilestone}
                            className="px-3 py-1 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)] transition-colors text-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingMilestone(null)}
                            className="px-3 py-1 bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] rounded-lg hover:bg-[var(--bg-surface)] transition-colors text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1">
                          <p className="font-medium text-[var(--text-primary)]">{milestone.name}</p>
                          {milestone.description && (
                            <p className="text-sm text-[var(--text-muted)]">{milestone.description}</p>
                          )}
                          <p className="text-xs text-[var(--text-muted)] mt-1">
                            {new Date(milestone.milestone_date).toLocaleDateString()}
                            {milestone.phase_id && ` • ${phases.find(p => p.id === milestone.phase_id)?.name || 'Unknown Phase'}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingMilestone(milestone)}
                            className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteMilestone(milestone.id)}
                            className="p-1.5 text-[var(--error)] hover:text-red-800 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {milestones.length === 0 && (
                  <p className="text-sm text-[var(--text-muted)] text-center py-4">No milestones yet. Create one below.</p>
                )}
              </div>
            </div>
            
            {/* Create Milestone Form */}
            <div className="border-t border-[var(--border-subtle)] pt-4">
              <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Create New Milestone</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  value={newMilestone.name}
                  onChange={(e) => setNewMilestone({ ...newMilestone, name: e.target.value })}
                  placeholder="Milestone name"
                  className="w-full px-4 py-2 border border-[var(--border-subtle)] rounded-xl focus:outline-none focus:border-[var(--accent)]"
                />
                <input
                  type="text"
                  value={newMilestone.description}
                  onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                  placeholder="Description (optional)"
                  className="w-full px-4 py-2 border border-[var(--border-subtle)] rounded-xl focus:outline-none focus:border-[var(--accent)]"
                />
                <input
                  type="date"
                  value={newMilestone.milestone_date}
                  onChange={(e) => setNewMilestone({ ...newMilestone, milestone_date: e.target.value })}
                  className="w-full px-4 py-2 border border-[var(--border-subtle)] rounded-xl focus:outline-none focus:border-[var(--accent)]"
                  required
                />
                <select
                  value={newMilestone.phase_id || ''}
                  onChange={(e) => setNewMilestone({ ...newMilestone, phase_id: e.target.value || null })}
                  className="w-full px-4 py-2 border border-[var(--border-subtle)] rounded-xl focus:outline-none focus:border-[var(--accent)]"
                >
                  <option value="">Unassigned</option>
                  {phases.map((phase) => (
                    <option key={phase.id} value={phase.id}>{phase.name}</option>
                  ))}
                </select>
                <button
                  onClick={handleCreateMilestone}
                  disabled={!newMilestone.name.trim() || !newMilestone.milestone_date}
                  className="w-full px-4 py-2 bg-[var(--accent)] text-white rounded-xl hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Milestone
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manage Milestones Button - Add near timeline header */}
      {activeView === 'timeline' && (
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => setShowMilestoneModal(true)}
            className="px-4 py-2 bg-[var(--accent)] text-white rounded-xl hover:bg-[var(--accent-hover)] transition-colors text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Manage Milestones
          </button>
        </div>
      )}

      {/* Filter Panel */}
      {showFilterPanel && (
        <div className="mb-4 p-4 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-[var(--text-primary)]">Filter Tasks</h4>
            <button
              onClick={() => setShowFilterPanel(false)}
              className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-primary)] mb-1">Status</label>
              <select
                value={taskStatusFilter}
                onChange={(e) => setTaskStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:border-[var(--accent)] text-sm"
              >
                <option value="all">All</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-primary)] mb-1">Phase</label>
              <select
                value={taskPhaseFilter}
                onChange={(e) => setTaskPhaseFilter(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:border-[var(--accent)] text-sm"
              >
                <option value="all">All</option>
                {phases.map((phase) => (
                  <option key={phase.id} value={phase.id}>{phase.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-primary)] mb-1">Priority</label>
              <select
                value={taskPriorityFilter}
                onChange={(e) => setTaskPriorityFilter(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:border-[var(--accent)] text-sm"
              >
                <option value="all">All</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
        </div>
      )}
      </WorkspaceLayout>
    </div>
  );
}

