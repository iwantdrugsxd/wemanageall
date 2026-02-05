import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import Page from '../components/layout/Page';
import TodayHeader from '../components/home/TodayHeader';
import KpiStrip from '../components/home/KpiStrip';
import FocusPanel from '../components/home/FocusPanel';
import ObjectivesPanel from '../components/home/ObjectivesPanel';
import ReflectionPanel from '../components/home/ReflectionPanel';
import TimeAllocationPanel from '../components/home/TimeAllocationPanel';
import CalendarPanel from '../components/home/CalendarPanel';
import InsightsPanel from '../components/home/InsightsPanel';
import ThinkingSpacePanel from '../components/home/ThinkingSpacePanel';
import Panel from '../components/layout/Panel';

export default function Home() {
  const { user } = useAuth();
  const location = useLocation();
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  
  // Today's Intention & Tasks
  const [intentions, setIntentions] = useState([]);
  const [newIntention, setNewIntention] = useState('');
  const [editingIntentionId, setEditingIntentionId] = useState(null);
  const [editingIntentionText, setEditingIntentionText] = useState('');
  const [intentionSaved, setIntentionSaved] = useState(false);
  const [intentionError, setIntentionError] = useState('');
  const [savingIntention, setSavingIntention] = useState(false);
  const [showAddIntention, setShowAddIntention] = useState(false);
  const [recentIntentions, setRecentIntentions] = useState([]);
  const [showRecentIntentions, setShowRecentIntentions] = useState(false);
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
  const [taskFilter, setTaskFilter] = useState('all'); // 'all', 'pending', 'completed', 'overdue'
  const [taskSort, setTaskSort] = useState('due-date'); // 'due-date', 'created'
  
  // Reflection
  const [reflection, setReflection] = useState('');
  const [reflectionMood, setReflectionMood] = useState(null);
  const [reflectionSaved, setReflectionSaved] = useState(false);
  const [reflectionError, setReflectionError] = useState('');
  const [savingReflection, setSavingReflection] = useState(false);
  const [reflectionLastSaved, setReflectionLastSaved] = useState(null);
  
  // Calendar Events
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    startTime: '',
    endTime: '',
    description: '',
    type: 'event'
  });
  const [savingEvent, setSavingEvent] = useState(false);
  const [eventError, setEventError] = useState('');
  
  // Thinking Space
  const [showThinkingSpace, setShowThinkingSpace] = useState(false);
  const [thoughtMode, setThoughtMode] = useState('freewrite');
  const [thoughtContent, setThoughtContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [thoughtError, setThoughtError] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [lastSaved, setLastSaved] = useState(null);
  const [todayThoughts, setTodayThoughts] = useState([]);
  const [editingThoughtId, setEditingThoughtId] = useState(null);
  const [editingThoughtContent, setEditingThoughtContent] = useState('');
  const [editingThoughtMode, setEditingThoughtMode] = useState('freewrite');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    fetchToday();
    
    // Update time and date
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      setCurrentTime(timeString);
      
      const dateString = now.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
      }).toUpperCase();
      setCurrentDate(dateString);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Refresh data when navigating back from calendar or when page becomes visible
  useEffect(() => {
    // Check if we're coming from calendar page
    const state = location.state;
    if (state?.fromCalendar) {
      fetchToday();
    }
  }, [location]);

  // Refresh data when page becomes visible (user navigates back from calendar)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchToday();
      }
    };

    const handleFocus = () => {
      fetchToday();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  useEffect(() => {
    const words = thoughtContent.trim().split(/\s+/).filter(word => word.length > 0).length;
    setWordCount(words);
  }, [thoughtContent]);

  useEffect(() => {
    // Auto-save thoughts every 30 seconds (only if not editing an existing thought)
    if (!thoughtContent.trim() || editingThoughtId) return;
    
    const interval = setInterval(async () => {
      if (thoughtContent.trim() && !editingThoughtId) {
        try {
          const response = await fetch('/api/thoughts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ content: thoughtContent, mode: thoughtMode }),
          });
          
          if (response.ok) {
            setLastSaved(new Date());
            const data = await response.json();
            if (data.entry) {
              fetchToday();
            }
          }
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [thoughtContent, thoughtMode, editingThoughtId]);

  const fetchToday = async () => {
    try {
      const response = await fetch('/api/today', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      setTasks(data.tasks || []);
      const intentionsData = Array.isArray(data.intentions) ? data.intentions : [];
      setIntentions(intentionsData);
      setTodayThoughts(data.thinkingSpace || []);
      setCalendarEvents(data.calendarEvents || []);
      setReflection(data.reflection || '');
      setReflectionMood(data.mood ?? null);
      
      if (data.thinkingSpace && data.thinkingSpace.length > 0) {
        const latestThought = data.thinkingSpace[0];
        setThoughtContent(latestThought.content || '');
        setThoughtMode(latestThought.mode || 'freewrite');
      }
      
      fetchRecentIntentions();
    } catch (error) {
      console.error('Failed to fetch today:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentIntentions = async () => {
    try {
      const response = await fetch('/api/today/intentions/recent?limit=7', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setRecentIntentions(data.intentions || []);
      }
    } catch (error) {
      console.error('Failed to fetch recent intentions:', error);
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
          time_estimate: timeEstimate ? parseFloat(timeEstimate) * 60 : null // Convert hours to minutes
        }),
      });
      
      if (response.ok) {
        fetchToday();
        setNewTask('');
        setNewTaskTimeEstimate('');
        setShowTaskInput(false);
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
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to update task:', errorData.error || 'Unknown error');
        return;
      }
      
      // Refresh today's data to get updated tasks with correct status
      fetchToday();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleUpdateTaskTime = async (taskId, timeSpent) => {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ time_spent: timeSpent * 60 }), // Convert hours to minutes
      });
      fetchToday();
    } catch (error) {
      console.error('Failed to update task time:', error);
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
        fetchToday();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to delete task');
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert('Network error. Please check your connection.');
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
    if (!editingTaskTitle.trim()) {
      alert('Task title cannot be empty');
      return;
    }
    
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
        fetchToday();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to update task');
      }
    } catch (error) {
      console.error('Failed to update task:', error);
      alert('Network error. Please check your connection.');
    }
  };

  const handleSaveReflection = async () => {
    setSavingReflection(true);
    setReflectionError('');
    
    try {
      // Check if reflection exists (we'll use POST which handles upsert via ON CONFLICT)
      const response = await fetch('/api/today/reflection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reflection, mood: reflectionMood }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setReflectionSaved(true);
        setReflectionLastSaved(new Date());
        setTimeout(() => setReflectionSaved(false), 3000);
        await fetchToday();
      } else {
        setReflectionError(data.error || 'Failed to save reflection');
        setTimeout(() => setReflectionError(''), 5000);
      }
    } catch (error) {
      console.error('Failed to save reflection:', error);
      setReflectionError('Network error. Please check your connection.');
      setTimeout(() => setReflectionError(''), 5000);
    } finally {
      setSavingReflection(false);
    }
  };

  const handleDeleteReflection = async () => {
    if (!confirm('Are you sure you want to delete this reflection?')) return;
    
    try {
      const response = await fetch('/api/today/reflection', {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (response.ok) {
        setReflection('');
        setReflectionMood(null);
        await fetchToday();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to delete reflection');
      }
    } catch (error) {
      console.error('Failed to delete reflection:', error);
      alert('Network error. Please check your connection.');
    }
  };

  const handleAddIntention = async () => {
    if (!newIntention.trim()) {
      setIntentionError('Please enter an intention');
      setTimeout(() => setIntentionError(''), 3000);
      return;
    }
    
    setSavingIntention(true);
    setIntentionError('');
    
    try {
      const response = await fetch('/api/today/intention', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ intention: newIntention.trim() }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setIntentionSaved(true);
        setNewIntention('');
        setShowAddIntention(false);
        setTimeout(() => setIntentionSaved(false), 3000);
        if (data.intention) {
          setIntentions(prev => [...prev, data.intention]);
        }
        await fetchToday();
        await fetchRecentIntentions();
      } else {
        setIntentionError(data.error || 'Failed to save intention');
        setTimeout(() => setIntentionError(''), 5000);
      }
    } catch (error) {
      console.error('Failed to save intention:', error);
      setIntentionError('Network error. Please check your connection.');
      setTimeout(() => setIntentionError(''), 5000);
    } finally {
      setSavingIntention(false);
    }
  };

  const handleEditIntention = (intention) => {
    setEditingIntentionId(intention.id);
    setEditingIntentionText(intention.intention);
  };

  const handleUpdateIntention = async () => {
    if (!editingIntentionText.trim()) {
      setIntentionError('Please enter an intention');
      setTimeout(() => setIntentionError(''), 3000);
      return;
    }
    
    setSavingIntention(true);
    setIntentionError('');
    
    try {
      const response = await fetch(`/api/today/intention/${editingIntentionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ intention: editingIntentionText.trim() }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setIntentionSaved(true);
        setEditingIntentionId(null);
        setEditingIntentionText('');
        setTimeout(() => setIntentionSaved(false), 3000);
        await fetchToday();
      } else {
        setIntentionError(data.error || 'Failed to update intention');
        setTimeout(() => setIntentionError(''), 5000);
      }
    } catch (error) {
      console.error('Failed to update intention:', error);
      setIntentionError('Network error. Please check your connection.');
      setTimeout(() => setIntentionError(''), 5000);
    } finally {
      setSavingIntention(false);
    }
  };

  const handleDeleteIntention = async (id) => {
    if (!confirm('Are you sure you want to delete this intention?')) return;
    
    try {
      const response = await fetch(`/api/today/intention/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (response.ok) {
        await fetchToday();
      }
    } catch (error) {
      console.error('Failed to delete intention:', error);
    }
  };

  const handleSaveThought = async () => {
    if (!thoughtContent.trim()) {
      setThoughtError('Please enter some content');
      setTimeout(() => setThoughtError(''), 3000);
      return;
    }
    
    setSaving(true);
    setThoughtError('');
    
    try {
      const response = await fetch('/api/thoughts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: thoughtContent, mode: thoughtMode }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSaved(true);
        setLastSaved(new Date());
        setThoughtContent('');
        setWordCount(0);
        setTimeout(() => setSaved(false), 3000);
        await fetchToday();
      } else {
        setThoughtError(data.error || 'Failed to save thought');
        setTimeout(() => setThoughtError(''), 5000);
      }
    } catch (error) {
      console.error('Failed to save:', error);
      setThoughtError('Network error. Please check your connection.');
      setTimeout(() => setThoughtError(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleEditThought = (thought) => {
    setEditingThoughtId(thought.id);
    setEditingThoughtContent(thought.content);
    setEditingThoughtMode(thought.mode);
    setShowThinkingSpace(true);
  };

  const handleUpdateThought = async () => {
    if (!editingThoughtContent.trim()) {
      setThoughtError('Please enter some content');
      setTimeout(() => setThoughtError(''), 3000);
      return;
    }
    
    setSaving(true);
    setThoughtError('');
    
    try {
      const response = await fetch(`/api/thoughts/${editingThoughtId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: editingThoughtContent, mode: editingThoughtMode }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSaved(true);
        setEditingThoughtId(null);
        setEditingThoughtContent('');
        setEditingThoughtMode('freewrite');
        setTimeout(() => setSaved(false), 3000);
        await fetchToday();
      } else {
        setThoughtError(data.error || 'Failed to update thought');
        setTimeout(() => setThoughtError(''), 5000);
      }
    } catch (error) {
      console.error('Failed to update thought:', error);
      setThoughtError('Network error. Please check your connection.');
      setTimeout(() => setThoughtError(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteThought = async (id) => {
    if (!confirm('Are you sure you want to delete this thought?')) return;
    
    try {
      const response = await fetch(`/api/thoughts/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (response.ok) {
        await fetchToday();
      }
    } catch (error) {
      console.error('Failed to delete thought:', error);
    }
  };

  const handleCreateEvent = async () => {
    if (!newEvent.title.trim() || !newEvent.startTime || !newEvent.endTime) {
      setEventError('Please fill in all required fields');
      setTimeout(() => setEventError(''), 3000);
      return;
    }

    setSavingEvent(true);
    setEventError('');

    try {
      const today = new Date();
      const [startHours, startMinutes] = newEvent.startTime.split(':').map(Number);
      const [endHours, endMinutes] = newEvent.endTime.split(':').map(Number);
      
      const startTime = new Date(today);
      startTime.setHours(startHours, startMinutes, 0, 0);
      
      const endTime = new Date(today);
      endTime.setHours(endHours, endMinutes, 0, 0);

      if (endTime <= startTime) {
        setEventError('End time must be after start time');
        setTimeout(() => setEventError(''), 3000);
        setSavingEvent(false);
        return;
      }

      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: newEvent.title.trim(),
          description: newEvent.description || null,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          type: newEvent.type,
          color: '#3B6E5C'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Refresh today's data to get updated calendar events
        fetchToday();
        setShowAddEvent(false);
        setNewEvent({
          title: '',
          startTime: '',
          endTime: '',
          description: '',
          type: 'event'
        });
        await fetchToday();
      } else {
        const errorData = await response.json();
        setEventError(errorData.error || 'Failed to create event');
        setTimeout(() => setEventError(''), 5000);
      }
    } catch (error) {
      console.error('Failed to create event:', error);
      setEventError('Network error. Please check your connection.');
      setTimeout(() => setEventError(''), 5000);
    } finally {
      setSavingEvent(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!confirm('Delete this event?')) return;
    
    try {
      const response = await fetch(`/api/calendar/events/${eventId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (response.ok) {
        // Remove from local state immediately for better UX
        setCalendarEvents(calendarEvents.filter(e => e.id !== eventId));
        // Refresh to ensure consistency
        await fetchToday();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to delete event');
      }
    } catch (error) {
      console.error('Failed to delete event:', error);
      alert('Network error. Please check your connection.');
    }
  };

  // Task filtering and sorting
  const getFilteredAndSortedTasks = () => {
    let filtered = [...tasks];
    
    // Apply filter
    if (taskFilter === 'pending') {
      filtered = filtered.filter(t => t.status === 'pending' || t.status === 'todo');
    } else if (taskFilter === 'completed') {
      filtered = filtered.filter(t => t.status === 'completed' || t.status === 'done');
    } else if (taskFilter === 'overdue') {
      const today = new Date().toISOString().split('T')[0];
      filtered = filtered.filter(t => {
        const isPending = t.status === 'pending' || t.status === 'todo';
        const isOverdue = t.due_date && t.due_date < today;
        return isPending && isOverdue;
      });
    }
    
    // Apply sorting
    if (taskSort === 'due-date') {
      filtered.sort((a, b) => {
        if (!a.due_date && !b.due_date) return new Date(a.created_at) - new Date(b.created_at);
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        if (a.due_date !== b.due_date) return a.due_date.localeCompare(b.due_date);
        return new Date(a.created_at) - new Date(b.created_at);
      });
    } else {
      filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }
    
    return filtered;
  };

  const filteredTasks = getFilteredAndSortedTasks();

  const firstName = user?.name?.split(' ')[0] || 'there';
  const completedTasks = tasks.filter(t => t.status === 'completed' || t.status === 'done').length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Calculate time allocation for pie chart
  const tasksWithTime = tasks.filter(task => task.time_estimate && task.time_estimate > 0);
  const totalTimeEstimated = tasksWithTime.reduce((sum, task) => sum + (task.time_estimate || 0), 0);
  const totalTimeSpent = tasks.reduce((sum, task) => sum + (task.time_spent || 0), 0);
  
  // Prepare data for pie chart - group by task
  const pieChartData = tasksWithTime.map((task, index) => {
    const hours = Math.round((task.time_estimate || 0) / 60 * 10) / 10; // Round to 1 decimal
    // Vibrant contrasting colors for better visibility
    const colors = [
      '#000000', // Black
      '#FCD34D', // Yellow
      '#3B82F6', // Blue
      '#10B981', // Green
      '#F59E0B', // Orange
      '#8B5CF6', // Purple
      '#EF4444', // Red
      '#06B6D4', // Cyan
      '#EC4899', // Pink
      '#84CC16', // Lime
      '#6366F1', // Indigo
      '#F97316', // Amber
    ];
    return {
      name: task.title.length > 20 ? task.title.substring(0, 20) + '...' : task.title,
      value: hours,
      minutes: task.time_estimate || 0,
      color: colors[index % colors.length],
      fullName: task.title
    };
  }).sort((a, b) => b.value - a.value); // Sort by time descending
  
  // Calculate percentages for display
  const timeAllocationPercentage = totalTimeEstimated > 0 ? Math.round((totalTimeSpent / totalTimeEstimated) * 100) : 0;

  // Get active and upcoming events
  const now = new Date();
  const activeEvents = calendarEvents.filter(event => {
    const start = new Date(event.start_time);
    const end = new Date(event.end_time);
    return start <= now && end >= now;
  });
  const upcomingEvents = calendarEvents.filter(event => {
    const start = new Date(event.start_time);
    return start > now;
  }).slice(0, 4);

  const formatTime = (minutes) => {
    if (!minutes) return '0h';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const formatTimeShort = (minutes) => {
    if (!minutes) return '0h';
    const hours = Math.floor(minutes / 60);
    return `${hours}h`;
  };

  const formatEventTime = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const startStr = start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const endStr = end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `${startStr} — ${endStr}`;
  };

  // Group events by day
  const groupEventsByDay = (events) => {
    const grouped = {};
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    events.forEach(event => {
      const eventDate = new Date(event.start_time);
      const dayKey = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
      const dayKeyStr = dayKey.toISOString().split('T')[0];
      
      if (!grouped[dayKeyStr]) {
        grouped[dayKeyStr] = {
          date: dayKey,
          events: []
        };
      }
      grouped[dayKeyStr].events.push(event);
    });
    
    // Sort events within each day by start time
    Object.keys(grouped).forEach(dayKey => {
      grouped[dayKey].events.sort((a, b) => 
        new Date(a.start_time) - new Date(b.start_time)
      );
    });
    
    return grouped;
  };

  const formatDayLabel = (date) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.getTime() === today.getTime()) {
      return 'TODAY';
    } else if (date.getTime() === tomorrow.getTime()) {
      return 'TOMORROW';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase();
    }
  };

  const eventsByDay = groupEventsByDay(calendarEvents);
  const sortedDayKeys = Object.keys(eventsByDay).sort();

  const thoughtModes = [
    { id: 'freewrite', label: 'Free write', desc: 'Write whatever is in your head. You don\'t need to make sense yet.' },
    { id: 'stuck', label: "I'm stuck", desc: 'Work through what\'s blocking you. Break it down.' },
    { id: 'decision', label: 'Decision draft', desc: 'Think through your options. What matters most?' },
  ];

  // Handler wrappers for components
  const handleCancelEditTask = () => {
    setEditingTaskId(null);
    setEditingTaskTitle('');
    setEditingTaskDueDate('');
    setEditingTaskTimeEstimate('');
    setEditingTaskTimeSpent('');
  };

  const handleCancelAddEvent = () => {
    setShowAddEvent(false);
    setNewEvent({ title: '', startTime: '', endTime: '', description: '', type: 'event' });
    setEventError('');
  };

  const handleCancelEditThought = () => {
    setEditingThoughtId(null);
    setEditingThoughtContent('');
    setEditingThoughtMode('freewrite');
  };

  // Calculate upcoming events count for KPI (reuse existing now variable)
  const upcomingEventsCount = upcomingEvents.length;

  if (loading) {
    return (
      <Page>
        <div className="flex items-center justify-center py-12">
          <div className="text-center transition-colors" style={{ color: 'var(--text-muted)' }}>
            Loading...
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      {/* Page Header with Quick Add */}
      <TodayHeader
        greeting={greeting}
        currentDate={currentDate}
        currentTime={currentTime}
        onQuickAddIntention={() => setShowAddIntention(true)}
        onQuickAddTask={() => setShowTaskInput(true)}
        onQuickAddEvent={() => setShowAddEvent(true)}
        onQuickAddThought={() => setShowThinkingSpace(true)}
      />

      {/* KPI Strip */}
      <KpiStrip
        completedTasks={completedTasks}
        totalTasks={totalTasks}
        progressPercentage={progressPercentage}
        totalTimeEstimated={totalTimeEstimated}
        totalTimeSpent={totalTimeSpent}
        upcomingEventsCount={upcomingEventsCount}
      />

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Primary) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Focus (Today's Intention) */}
          <FocusPanel
            intentions={intentions}
            newIntention={newIntention}
            setNewIntention={setNewIntention}
            showAddIntention={showAddIntention}
            setShowAddIntention={setShowAddIntention}
            editingIntentionId={editingIntentionId}
            setEditingIntentionId={setEditingIntentionId}
            editingIntentionText={editingIntentionText}
            setEditingIntentionText={setEditingIntentionText}
            intentionSaved={intentionSaved}
            intentionError={intentionError}
            savingIntention={savingIntention}
            onAddIntention={handleAddIntention}
            onUpdateIntention={handleUpdateIntention}
            onDeleteIntention={handleDeleteIntention}
            onEditIntention={handleEditIntention}
          />

          {/* Objectives (Tasks) */}
          <ObjectivesPanel
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

          {/* Reflection */}
          <ReflectionPanel
            reflection={reflection}
            setReflection={setReflection}
            reflectionMood={reflectionMood}
            setReflectionMood={setReflectionMood}
            reflectionSaved={reflectionSaved}
            reflectionLastSaved={reflectionLastSaved}
            reflectionError={reflectionError}
            savingReflection={savingReflection}
            onSaveReflection={handleSaveReflection}
            onDeleteReflection={handleDeleteReflection}
          />

          {/* Time Allocation */}
          <TimeAllocationPanel
            pieChartData={pieChartData}
            totalTimeEstimated={totalTimeEstimated}
          />
        </div>

        {/* Right Column (Secondary) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Agenda (Schedule) */}
          <CalendarPanel
            calendarEvents={calendarEvents}
            showAddEvent={showAddEvent}
            setShowAddEvent={setShowAddEvent}
            newEvent={newEvent}
            setNewEvent={setNewEvent}
            eventError={eventError}
            savingEvent={savingEvent}
            eventsByDay={eventsByDay}
            sortedDayKeys={sortedDayKeys}
            formatDayLabel={formatDayLabel}
            formatEventTime={formatEventTime}
            onCreateEvent={handleCreateEvent}
            onDeleteEvent={handleDeleteEvent}
            onCancelAddEvent={handleCancelAddEvent}
          />

          {/* Insights */}
          <InsightsPanel />

          {/* Thinking Space */}
          <ThinkingSpacePanel
            showThinkingSpace={showThinkingSpace}
            setShowThinkingSpace={setShowThinkingSpace}
            thoughtMode={thoughtMode}
            setThoughtMode={setThoughtMode}
            thoughtContent={thoughtContent}
            setThoughtContent={setThoughtContent}
            wordCount={wordCount}
            lastSaved={lastSaved}
            saved={saved}
            thoughtError={thoughtError}
            saving={saving}
            todayThoughts={todayThoughts}
            editingThoughtId={editingThoughtId}
            editingThoughtContent={editingThoughtContent}
            setEditingThoughtContent={setEditingThoughtContent}
            editingThoughtMode={editingThoughtMode}
            setEditingThoughtMode={setEditingThoughtMode}
            thoughtModes={thoughtModes}
            onSaveThought={handleSaveThought}
            onUpdateThought={handleUpdateThought}
            onEditThought={handleEditThought}
            onDeleteThought={handleDeleteThought}
            onCancelEditThought={handleCancelEditThought}
          />
        </div>
      </div>
    </Page>
  );
}
