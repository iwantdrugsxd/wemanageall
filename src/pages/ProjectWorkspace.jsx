import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProjectWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [phases, setPhases] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [activeView, setActiveView] = useState('board'); // list, board, timeline, notes
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
      time_estimate: task.time_estimate || '',
      time_spent: task.time_spent || 0
    });
    fetchTaskDependencies(task.id);
  };

  const handleUpdateTask = async () => {
    if (!editingTaskData) return;
    
    try {
      const response = await fetch(`/api/projects/${id}/tasks/${editingTaskData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editingTaskData),
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
        <div className="text-gray-600">Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  const tasksByStatus = {
    todo: tasks.filter(t => t.status === 'todo'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    done: tasks.filter(t => t.status === 'done'),
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm text-black mb-1">PROJECT WORKSPACE</p>
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-4xl font-bold text-black">{project.name}</h1>
          <div className="flex items-center gap-3">
            {(userRole === 'owner' || userRole === 'admin') && (
              <button
                onClick={() => setShowShareModal(true)}
                className="px-4 py-2 border border-black text-black rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share
              </button>
            )}
            <button
              onClick={() => setShowCollaborators(!showCollaborators)}
              className="px-4 py-2 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              {collaborators.length + 1}
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter
            </button>
            <button
              onClick={() => setShowAddTask(true)}
              className="px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-900 transition-colors flex items-center gap-2"
            >
              <span>+</span>
              Add Task
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-6 border-b border-gray-300">
          {['list', 'board', 'timeline', 'notes'].map((view) => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={`pb-3 px-2 text-sm font-medium transition-colors capitalize ${
                activeView === view
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              {view}
            </button>
          ))}
        </div>
      </div>

      {/* Board View */}
      {activeView === 'board' && (
        <div className="grid grid-cols-3 gap-6">
          {['todo', 'in_progress', 'done'].map((status) => (
            <div
              key={status}
              className="bg-gray-100/30 rounded-xl p-4"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, status)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-sm font-semibold text-black uppercase">
                  {status === 'todo' ? 'TO DO' : status === 'in_progress' ? 'IN PROGRESS' : 'DONE'}
                  <span className="ml-2 text-gray-500 font-normal">
                    ({tasksByStatus[status].length})
                  </span>
                </h3>
                <button className="text-black hover:text-black text-lg">+</button>
              </div>
              
              <div className="space-y-3">
                {tasksByStatus[status].map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task)}
                    className="bg-white rounded-xl p-4 border border-gray-300 cursor-move hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-black text-sm mb-1">{task.title}</h4>
                        {task.description && (
                          <p className="text-xs text-gray-500 line-clamp-2">{task.description}</p>
                        )}
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        <button
                          onClick={() => setEditingTask(task)}
                          className="p-1 text-gray-600 hover:text-black"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1 text-gray-600 hover:text-black"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    {task.due_date && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDate(task.due_date)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {activeView === 'list' && (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-xl p-4 border border-gray-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={task.status === 'done'}
                  onChange={(e) => handleUpdateTaskStatus(task.id, e.target.checked ? 'done' : 'todo')}
                  className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
                />
                <div className="flex-1">
                  <h4 className={`font-medium text-black ${task.status === 'done' ? 'line-through text-gray-500' : ''}`}>
                    {task.title}
                  </h4>
                  {task.description && (
                    <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {task.due_date && (
                    <span className="text-xs text-gray-500">{formatDate(task.due_date)}</span>
                  )}
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    task.status === 'done' ? 'bg-gray-200 text-black' :
                    task.status === 'in_progress' ? 'bg-gray-200 text-black' :
                    'bg-gray-200 text-black'
                  }`}>
                    {task.status === 'done' ? 'Done' : task.status === 'in_progress' ? 'In Progress' : 'To Do'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Timeline View */}
      {activeView === 'timeline' && (
        <div className="bg-white rounded-xl border border-gray-300">
          <div className="p-6 border-b border-gray-300 flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold text-black">Timeline</h3>
            <div className="flex items-center gap-2">
              {['weeks', 'months', 'quarter'].map((scale) => (
                <button
                  key={scale}
                  onClick={() => setTimelineScale(scale)}
                  className={`px-3 py-1 rounded-lg text-sm capitalize ${
                    timelineScale === scale
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                className="ml-4 px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-900 transition-colors flex items-center gap-2 text-sm"
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
                <h4 className="text-sm font-semibold text-black mb-4 uppercase">Tasks & Milestones</h4>
                <div className="space-y-4">
                  {phases.map((phase) => (
                    <div key={phase.id} className="mb-6">
                      <h5 className="text-xs font-semibold text-black mb-2 uppercase">{phase.name}</h5>
                      <div className="space-y-2">
                        {tasks
                          .filter(t => t.phase_id === phase.id)
                          .map((task) => (
                            <div key={task.id} className="flex items-center gap-2 text-sm text-gray-600">
                              <div className="w-2 h-2 rounded-full bg-black"></div>
                              <span>{task.title}</span>
                            </div>
                          ))}
                      </div>
                      {milestones
                        .filter(m => m.phase_id === phase.id)
                        .map((milestone) => (
                          <div key={milestone.id} className="flex items-center gap-2 text-sm text-black mt-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                            </svg>
                            <span>{milestone.name}</span>
                          </div>
                        ))}
                    </div>
                  ))}
                  
                  {tasks.filter(t => !t.phase_id).length > 0 && (
                    <div>
                      <h5 className="text-xs font-semibold text-black mb-2 uppercase">Unassigned</h5>
                      <div className="space-y-2">
                        {tasks
                          .filter(t => !t.phase_id)
                          .map((task) => (
                            <div key={task.id} className="flex items-center gap-2 text-sm text-gray-600">
                              <div className="w-2 h-2 rounded-full bg-black"></div>
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
                <div className="bg-gray-100/30 rounded-xl p-4">
                  <div className="grid grid-cols-5 gap-2 mb-4">
                    {['Oct Week 1', 'Oct Week 2', 'Oct Week 3', 'Oct Week 4', 'Nov Week 1'].map((week) => (
                      <div key={week} className="text-xs text-gray-500 text-center font-medium">
                        {week}
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-2">
                    {tasks.map((task) => {
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
                            <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                            </svg>
                            <span className="ml-2 text-xs text-black font-medium">{milestone.name}</span>
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
          <div className="bg-white rounded-xl border border-gray-300 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-semibold text-black">Project Notes</h3>
              <button
                onClick={() => {
                  setNewNote({ title: '', content: '' });
                  setEditingNoteId(null);
                }}
                className="px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-900 transition-colors text-sm"
              >
                + New Note
              </button>
            </div>
            
            {/* New/Edit Note Form */}
            {(editingNoteId || (!editingNoteId && (newNote.title || newNote.content))) && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
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
                  className="w-full px-3 py-2 mb-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black text-sm"
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
                  className="w-full min-h-[200px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black resize-none text-sm"
                />
                <div className="flex gap-2 mt-2">
                  {!editingNoteId && (
                    <button
                      onClick={handleCreateNote}
                      disabled={!newNote.content.trim()}
                      className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 text-sm"
                    >
                      Save Note
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setNewNote({ title: '', content: '' });
                      setEditingNoteId(null);
                    }}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            
            {/* Notes List */}
            <div className="space-y-3">
              {notes.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">No notes yet. Create your first note above.</p>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className="p-4 bg-white border border-gray-300 rounded-lg hover:shadow-md transition-all">
                    {editingNoteId === note.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={note.title || ''}
                          onChange={(e) => handleUpdateNote(note.id, { ...note, title: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black text-sm font-medium"
                        />
                        <textarea
                          value={note.content}
                          onChange={(e) => handleUpdateNote(note.id, { ...note, content: e.target.value })}
                          className="w-full min-h-[150px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black resize-none text-sm"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingNoteId(null)}
                            className="px-3 py-1.5 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors text-xs"
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
                              <h4 className="font-medium text-black mb-1">{note.title}</h4>
                            )}
                            <p className="text-sm text-gray-600 whitespace-pre-wrap">{note.content}</p>
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(note.updated_at || note.created_at).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setEditingNoteId(note.id)}
                              className="p-1.5 text-gray-400 hover:text-black transition-colors"
                              title="Edit note"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteNote(note.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
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
            <div className="mt-4 flex items-center gap-2 p-2 bg-gray-100 rounded-lg">
              <button className="p-2 hover:bg-white rounded" title="Bold">
                <span className="font-bold text-sm">B</span>
              </button>
              <button className="p-2 hover:bg-white rounded" title="Italic">
                <span className="italic text-sm">I</span>
              </button>
              <button className="p-2 hover:bg-white rounded" title="Underline">
                <span className="underline text-sm">U</span>
              </button>
              <div className="w-px h-6 bg-gray-200 mx-1"></div>
              <button className="p-2 hover:bg-white rounded" title="Bullet List">
                <span className="text-sm">•</span>
              </button>
              <button className="p-2 hover:bg-white rounded" title="Numbered List">
                <span className="text-sm">1.</span>
              </button>
              <button className="p-2 hover:bg-white rounded" title="Checkbox List">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <div className="w-px h-6 bg-gray-200 mx-1"></div>
              <button className="p-2 hover:bg-white rounded" title="Image">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
              <button className="p-2 hover:bg-white rounded" title="Link">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </button>
              <div className="flex-1"></div>
              <button className="px-3 py-1 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors flex items-center gap-1 text-sm">
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
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-lg font-semibold text-black mb-4">Add Task</h3>
            <form onSubmit={handleCreateTask}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-black mb-2">Task Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="e.g., Define North Star Metrics"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-black"
                  required
                  autoFocus
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-black mb-2">Description (optional)</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Add details..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-black resize-none"
                  rows={3}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-black mb-2">Status</label>
                <select
                  value={newTask.status}
                  onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-black"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-black mb-2">Due Date (optional)</label>
                <input
                  type="date"
                  value={newTask.due_date}
                  onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-black"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-6 py-2 bg-black text-white rounded-xl hover:bg-gray-900 transition-colors"
                >
                  Add Task
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddTask(false);
                    setNewTask({ title: '', description: '', status: 'todo', due_date: '' });
                  }}
                  className="px-6 py-2 bg-white border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
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
            className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-xl font-semibold text-black mb-2">Share Project</h3>
            <p className="text-sm text-gray-600 mb-6">Share this code with others to collaborate on this project.</p>
            
            {shareCode ? (
              <div className="mb-6">
                <label className="block text-sm font-medium text-black mb-2">Share Code</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={shareCode}
                    readOnly
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-center text-2xl font-mono tracking-widest"
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
                    className="px-4 py-3 bg-black text-white rounded-xl hover:bg-gray-900 transition-colors"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Anyone with this code can join the project</p>
              </div>
            ) : (
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-4">No share code exists. Generate one to share this project.</p>
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
                  className="w-full px-4 py-3 bg-black text-white rounded-xl hover:bg-gray-900 transition-colors"
                >
                  Generate Share Code
                </button>
              </div>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowShareModal(false)}
                className="flex-1 px-6 py-2 bg-white border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
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
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-lg font-semibold text-black">Collaborators</h3>
              <button
                onClick={() => setShowCollaborators(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-3">
              {/* Owner */}
              <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white font-semibold">
                  {project?.name?.charAt(0) || 'O'}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-black">You (Owner)</p>
                  <p className="text-xs text-gray-500">Project Owner</p>
                </div>
                <span className="px-2 py-1 text-xs bg-black text-white rounded-full">Owner</span>
              </div>
              
              {/* Collaborators */}
              {collaborators.map((collab) => (
                <div key={collab.user_id} className="flex items-center gap-3 p-3 bg-gray-100 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-semibold">
                    {collab.user_name?.charAt(0) || collab.user_email?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-black">{collab.user_name || collab.user_email}</p>
                    <p className="text-xs text-gray-500">Joined {new Date(collab.joined_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    collab.role === 'admin' ? 'bg-gray-200 text-black' :
                    collab.role === 'editor' ? 'bg-gray-200 text-black' :
                    'bg-gray-200 text-black'
                  }`}>
                    {collab.role}
                  </span>
                </div>
              ))}
              
              {collaborators.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-8">No collaborators yet. Share the project to invite others!</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

