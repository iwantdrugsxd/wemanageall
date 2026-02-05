import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import Panel from '../../layout/Panel';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Select from '../../ui/Select';
import IconButton from '../../ui/IconButton';
import Badge from '../../ui/Badge';
import { cn } from '../../../lib/cn';

/**
 * Tasks View Component
 * Daily objectives/tasks management (mirrors Home/Dashboard behavior)
 */
export default function TasksView({ openComposerSignal }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState('');
  const [newTaskTimeEstimate, setNewTaskTimeEstimate] = useState('');
  const [showTaskInput, setShowTaskInput] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState('');
  const [editingTaskDueDate, setEditingTaskDueDate] = useState('');
  const [editingTaskTimeEstimate, setEditingTaskTimeEstimate] = useState('');
  const [editingTaskTimeSpent, setEditingTaskTimeSpent] = useState('');
  const [taskFilter, setTaskFilter] = useState('all');
  const [taskSort, setTaskSort] = useState('due-date');
  const taskInputRef = useRef(null);

  // Open composer when signal changes
  useEffect(() => {
    if (openComposerSignal > 0) {
      setShowTaskInput(true);
      setTimeout(() => {
        taskInputRef.current?.focus();
      }, 100);
    }
  }, [openComposerSignal]);

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/today', {
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

  const handleAddTask = async () => {
    if (!newTask || !newTask.trim()) return;
    
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          title: newTask.trim(), 
          dueDate: new Date().toISOString().split('T')[0],
          time_estimate: newTaskTimeEstimate ? parseFloat(newTaskTimeEstimate) * 60 : null
        }),
      });
      
      if (response.ok) {
        setNewTask('');
        setNewTaskTimeEstimate('');
        setShowTaskInput(false);
        await fetchTasks();
      }
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  };

  const handleToggleTask = async (taskId, completed) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: completed ? 'completed' : 'pending' }),
      });
      
      if (response.ok) {
        await fetchTasks();
      }
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleEditTask = (task) => {
    setEditingTaskId(task.id);
    setEditingTaskTitle(task.title || '');
    setEditingTaskDueDate(task.due_date || new Date().toISOString().split('T')[0]);
    setEditingTaskTimeEstimate(task.time_estimate ? Math.round(task.time_estimate / 60) : '');
    setEditingTaskTimeSpent(task.time_spent ? Math.round(task.time_spent / 60) : '');
  };

  const handleUpdateTask = async () => {
    if (!editingTaskTitle.trim()) return;
    
    try {
      const response = await fetch(`/api/tasks/${editingTaskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: editingTaskTitle.trim(),
          due_date: editingTaskDueDate,
          time_estimate: editingTaskTimeEstimate ? parseFloat(editingTaskTimeEstimate) * 60 : null,
          time_spent: editingTaskTimeSpent ? parseFloat(editingTaskTimeSpent) * 60 : null,
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

  // Filter and sort tasks
  const getFilteredTasks = () => {
    let filtered = [...tasks];
    const today = new Date().toISOString().split('T')[0];
    
    if (taskFilter === 'pending') {
      filtered = filtered.filter(t => t.status !== 'completed' && t.status !== 'done');
    } else if (taskFilter === 'completed') {
      filtered = filtered.filter(t => t.status === 'completed' || t.status === 'done');
    } else if (taskFilter === 'overdue') {
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
  const today = new Date().toISOString().split('T')[0];

  if (loading) {
    return (
      <Panel>
        <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
          Loading tasks...
        </div>
      </Panel>
    );
  }

  return (
    <Panel
      title="Tasks"
      actions={
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--text-muted)]">{progressPercentage}%</span>
        </div>
      }
    >
      {/* Filters and Sort */}
      <div className="flex items-center gap-2 mb-4">
        <Select
          value={taskFilter}
          onChange={(e) => setTaskFilter(e.target.value)}
          className="text-xs"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="overdue">Overdue</option>
        </Select>
        <Select
          value={taskSort}
          onChange={(e) => setTaskSort(e.target.value)}
          className="text-xs"
        >
          <option value="due-date">Due Date</option>
          <option value="created">Created</option>
        </Select>
      </div>

      {/* Add Task Input */}
      {showTaskInput && (
        <div className="flex flex-col sm:flex-row items-center gap-2 mb-4">
          <Input
            ref={taskInputRef}
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddTask();
              }
            }}
          />
          <Input
            type="number"
            value={newTaskTimeEstimate}
            onChange={(e) => setNewTaskTimeEstimate(e.target.value)}
            placeholder="Est. hours"
            className="w-24"
          />
          <Button onClick={handleAddTask} size="sm">Add</Button>
          <Button variant="ghost" onClick={() => setShowTaskInput(false)} size="sm">Cancel</Button>
        </div>
      )}

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-[var(--text-muted)]">
            {taskFilter === 'all' ? 'No tasks yet' : `No ${taskFilter} tasks`}
          </p>
          {!showTaskInput && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowTaskInput(true)}
              className="mt-4"
            >
              Add Task
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTasks.map((task) => {
            const timeSpent = task.time_spent ? Math.round(task.time_spent / 60) : 0;
            const timeEstimate = task.time_estimate ? Math.round(task.time_estimate / 60) : null;
            const isCompleted = task.status === 'completed' || task.status === 'done';
            const isOverdue = !isCompleted && task.due_date && task.due_date < today;

            return editingTaskId === task.id ? (
              <div key={task.id} className="p-3 rounded border space-y-2" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
                <Input
                  type="text"
                  value={editingTaskTitle}
                  onChange={(e) => setEditingTaskTitle(e.target.value)}
                  placeholder="Task title"
                />
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={editingTaskDueDate}
                    onChange={(e) => setEditingTaskDueDate(e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={editingTaskTimeEstimate}
                    onChange={(e) => setEditingTaskTimeEstimate(e.target.value)}
                    placeholder="Est. hours"
                    className="w-24"
                  />
                  <Input
                    type="number"
                    value={editingTaskTimeSpent}
                    onChange={(e) => setEditingTaskTimeSpent(e.target.value)}
                    placeholder="Spent hours"
                    className="w-24"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" size="sm" onClick={handleCancelEditTask}>Cancel</Button>
                  <Button size="sm" onClick={handleUpdateTask}>Save</Button>
                </div>
              </div>
            ) : (
              <div key={task.id} className="group flex items-center gap-3 p-2 rounded hover:bg-[var(--bg-surface)] transition-colors">
                <input
                  type="checkbox"
                  checked={isCompleted}
                  onChange={(e) => handleToggleTask(task.id, e.target.checked)}
                  className="w-4 h-4 rounded border-[var(--border-subtle)]"
                />
                <label
                  className={cn(
                    "flex-1 text-sm text-[var(--text-primary)] cursor-pointer",
                    isCompleted && "line-through text-[var(--text-muted)]"
                  )}
                >
                  {task.title}
                </label>
                <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                  {isOverdue && <Badge variant="danger">Overdue</Badge>}
                  {task.due_date && (
                    <span className="flex-shrink-0">
                      {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                  {timeEstimate !== null && (
                    <span className="flex-shrink-0">{timeSpent}/{timeEstimate}h</span>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <IconButton
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditTask(task)}
                    aria-label="Edit task"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </IconButton>
                  <IconButton
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTask(task.id)}
                    aria-label="Delete task"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </IconButton>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
}
