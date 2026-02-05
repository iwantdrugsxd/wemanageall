import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Calendar from './Calendar';
import Notifications from './Notifications';
import TasksPanel from '../components/home/TasksPanel';

/**
 * Work Hub - Central execution center for tasks, calendar, and notifications
 * Phase 4: Unified interface with tabs
 */
export default function Work() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const view = searchParams.get('view') || 'tasks';

  // Tasks state (reused from Dashboard)
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [newTaskTimeEstimate, setNewTaskTimeEstimate] = useState('');
  const [showTaskInput, setShowTaskInput] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState('');
  const [editingTaskDueDate, setEditingTaskDueDate] = useState('');
  const [editingTaskTimeEstimate, setEditingTaskTimeEstimate] = useState('');
  const [editingTaskTimeSpent, setEditingTaskTimeSpent] = useState('');
  const [taskFilter, setTaskFilter] = useState('all');
  const [taskSort, setTaskSort] = useState('due-date');

  // Fetch tasks
  useEffect(() => {
    if (user && view === 'tasks') {
      fetchTasks();
    }
  }, [user, view]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/tasks?date=${today}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks || []);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (taskTitle, timeEstimate = null) => {
    if (!taskTitle || !taskTitle.trim()) return;
    
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: taskTitle.trim(),
          dueDate: new Date().toISOString().split('T')[0],
          time_estimate: timeEstimate ? parseFloat(timeEstimate) * 60 : null
        }),
      });
      
      if (response.ok) {
        setNewTask('');
        setNewTaskTimeEstimate('');
        setShowTaskInput(false);
        await fetchTasks();
      }
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleToggleTask = async (taskId, completed) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          status: completed ? 'completed' : 'pending'
        }),
      });
      
      if (!response.ok) {
        return;
      }
      
      await fetchTasks();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleEditTask = (task) => {
    setEditingTaskId(task.id);
    setEditingTaskTitle(task.title || '');
    setEditingTaskDueDate(task.due_date || '');
    setEditingTaskTimeEstimate(task.time_estimate ? Math.round(task.time_estimate / 60).toString() : '');
    setEditingTaskTimeSpent(task.time_spent ? Math.round(task.time_spent / 60).toString() : '');
  };

  const handleUpdateTask = async () => {
    if (!editingTaskId || !editingTaskTitle.trim()) return;
    
    try {
      const response = await fetch(`/api/tasks/${editingTaskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: editingTaskTitle.trim(),
          due_date: editingTaskDueDate || null,
          time_estimate: editingTaskTimeEstimate ? parseInt(editingTaskTimeEstimate) * 60 : null,
          time_spent: editingTaskTimeSpent ? parseInt(editingTaskTimeSpent) * 60 : null
        }),
      });
      
      if (response.ok) {
        setEditingTaskId(null);
        setEditingTaskTitle('');
        setEditingTaskDueDate('');
        setEditingTaskTimeEstimate('');
        setEditingTaskTimeSpent('');
        await fetchTasks();
      }
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (response.ok) {
        await fetchTasks();
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleCancelEditTask = () => {
    setEditingTaskId(null);
    setEditingTaskTitle('');
    setEditingTaskDueDate('');
    setEditingTaskTimeEstimate('');
    setEditingTaskTimeSpent('');
  };

  const handleTabChange = (newView) => {
    setSearchParams({ view: newView });
  };

  // Task filtering and sorting
  const getFilteredTasks = () => {
    let filtered = [...tasks];
    
    if (taskFilter === 'pending') {
      filtered = filtered.filter(t => t.status !== 'completed' && t.status !== 'done');
    } else if (taskFilter === 'completed') {
      filtered = filtered.filter(t => t.status === 'completed' || t.status === 'done');
    } else if (taskFilter === 'overdue') {
      const today = new Date().toISOString().split('T')[0];
      filtered = filtered.filter(t => 
        t.due_date && 
        t.due_date < today && 
        t.status !== 'completed' && 
        t.status !== 'done'
      );
    }
    
    if (taskSort === 'due-date') {
      filtered.sort((a, b) => {
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return a.due_date.localeCompare(b.due_date);
      });
    } else if (taskSort === 'created') {
      filtered.sort((a, b) => {
        const aDate = new Date(a.created_at || 0);
        const bDate = new Date(b.created_at || 0);
        return bDate - aDate;
      });
    }
    
    return filtered;
  };

  const filteredTasks = getFilteredTasks();
  const completedTasks = tasks.filter(t => t.status === 'completed' || t.status === 'done').length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // For Calendar and Notifications, they have their own containers, so we render them directly
  // For Tasks, we use our own container
  if (view === 'calendar' || view === 'notifications') {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-light transition-colors mb-1" style={{ color: 'var(--text-primary)' }}>
                  Work
                </h1>
                <p className="text-sm transition-colors" style={{ color: 'var(--text-muted)' }}>
                  Execution hub for tasks, schedules, and alerts
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
            <div className="flex items-center gap-6">
              {['tasks', 'calendar', 'notifications'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`pb-3 px-2 text-sm font-medium transition-colors capitalize relative ${
                    view === tab ? '' : ''
                  }`}
                  style={view === tab ? {
                    color: 'var(--text-primary)'
                  } : {
                    color: 'var(--text-muted)'
                  }}
                  onMouseEnter={(e) => {
                    if (view !== tab) {
                      e.target.style.color = 'var(--text-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (view !== tab) {
                      e.target.style.color = 'var(--text-muted)';
                    }
                  }}
                >
                  {tab === 'tasks' ? 'Tasks' : tab === 'calendar' ? 'Calendar' : 'Notifications'}
                  {view === tab && (
                    <div 
                      className="absolute bottom-0 left-0 right-0 h-0.5"
                      style={{ backgroundColor: 'var(--accent)' }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Render Calendar or Notifications (they have their own containers) */}
        {view === 'calendar' && <Calendar />}
        {view === 'notifications' && <Notifications />}
      </div>
    );
  }

  // Tasks view with our own container
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-light transition-colors mb-1" style={{ color: 'var(--text-primary)' }}>
                Work
              </h1>
              <p className="text-sm transition-colors" style={{ color: 'var(--text-muted)' }}>
                Execution hub for tasks, schedules, and alerts
              </p>
            </div>
            <button
              onClick={() => setShowTaskInput(true)}
              className="px-4 py-2 rounded-lg text-sm transition-colors"
              style={{
                backgroundColor: 'var(--accent)',
                color: 'var(--bg-base)'
              }}
            >
              New Task
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center gap-6">
            {['tasks', 'calendar', 'notifications'].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`pb-3 px-2 text-sm font-medium transition-colors capitalize relative ${
                  view === tab ? '' : ''
                }`}
                style={view === tab ? {
                  color: 'var(--text-primary)'
                } : {
                  color: 'var(--text-muted)'
                }}
                onMouseEnter={(e) => {
                  if (view !== tab) {
                    e.target.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (view !== tab) {
                    e.target.style.color = 'var(--text-muted)';
                  }
                }}
              >
                {tab === 'tasks' ? 'Tasks' : tab === 'calendar' ? 'Calendar' : 'Notifications'}
                {view === tab && (
                  <div 
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ backgroundColor: 'var(--accent)' }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tasks Panel */}
        <div>
          {loading ? (
            <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
              Loading tasks...
            </div>
          ) : (
            <TasksPanel
              filteredTasks={filteredTasks}
              taskFilter={taskFilter}
              setTaskFilter={setTaskFilter}
              taskSort={taskSort}
              setTaskSort={setTaskSort}
              progressPercentage={progressPercentage}
              showTaskInput={showTaskInput}
              setShowTaskInput={setShowTaskInput}
              newTask={newTask}
              setNewTask={setNewTask}
              newTaskTimeEstimate={newTaskTimeEstimate}
              setNewTaskTimeEstimate={setNewTaskTimeEstimate}
              editingTaskId={editingTaskId}
              editingTaskTitle={editingTaskTitle}
              setEditingTaskTitle={setEditingTaskTitle}
              editingTaskDueDate={editingTaskDueDate}
              setEditingTaskDueDate={setEditingTaskDueDate}
              editingTaskTimeEstimate={editingTaskTimeEstimate}
              setEditingTaskTimeEstimate={setEditingTaskTimeEstimate}
              editingTaskTimeSpent={editingTaskTimeSpent}
              setEditingTaskTimeSpent={setEditingTaskTimeSpent}
              onAddTask={handleAddTask}
              onToggleTask={handleToggleTask}
              onEditTask={handleEditTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              onCancelEditTask={handleCancelEditTask}
            />
          )}
        </div>
      </div>
    </div>
  );
}
