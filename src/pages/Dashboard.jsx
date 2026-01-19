import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import InsightsWidget from '../components/InsightsWidget';

export default function Dashboard() {
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
    // Auto-save thoughts every 30 seconds
    if (!thoughtContent.trim()) return;
    
    const interval = setInterval(async () => {
      if (thoughtContent.trim()) {
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
  }, [thoughtContent, thoughtMode]);

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

  const firstName = user?.name?.split(' ')[0] || 'there';
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
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

  if (loading) {
    return <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 text-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="text-label text-gray-500 mb-2">PERSONAL LIFE OS</div>
        <h1 className="text-h2 text-gray-900 mb-3">
          {greeting}, {firstName}.
        </h1>
        <p className="text-body-sm text-gray-600 italic font-serif">
          "The present moment is the only time over which we have dominion."
        </p>
      </div>

      {/* Insights Widget */}
      <InsightsWidget />

      {/* Main Grid Layout */}
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        {/* Left Column */}
        <div className="md:col-span-2 space-y-6">
          {/* Today's Intention */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs uppercase tracking-wider text-gray-700 font-medium">TODAY'S INTENTION</h3>
              {intentionSaved && (
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          
          {intentions && intentions.length > 0 ? (
              <div className="space-y-2 mb-4">
              {intentions.map((intention) => (
                  <div key={intention.id} className="group flex items-center gap-3">
                  {editingIntentionId === intention.id ? (
                      <div className="flex-1 flex items-center gap-2">
          <input
            type="text"
                        value={editingIntentionText}
                        onChange={(e) => setEditingIntentionText(e.target.value)}
                          className="flex-1 px-3 py-2 border-b border-gray-300 focus:outline-none focus:border-gray-900 text-sm"
                        autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleUpdateIntention();
                            if (e.key === 'Escape') {
                              setEditingIntentionId(null);
                              setEditingIntentionText('');
                            }
                          }}
          />
          <button
                        onClick={handleUpdateIntention}
                          className="px-3 py-1 text-xs text-gray-700 hover:text-gray-900"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingIntentionId(null);
                          setEditingIntentionText('');
                        }}
                          className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700"
                      >
                        Cancel
          </button>
                  </div>
                  ) : (
                    <>
                        <input
                          type="text"
                          value={intention.intention}
                          readOnly
                          className="flex-1 px-3 py-2 border-b border-gray-200 text-sm text-gray-700 bg-transparent"
                        />
                        <button
                          onClick={() => handleEditIntention(intention)}
                          className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          EDIT
                        </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
              showAddIntention ? (
            <div className="mb-4">
              <input
                type="text"
                value={newIntention}
                    onChange={(e) => setNewIntention(e.target.value)}
                    placeholder="Focus on high-fidelity architectural time management"
                    className="w-full px-3 py-2 border-b border-gray-300 focus:outline-none focus:border-gray-900 text-sm"
                autoFocus
                onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddIntention();
                      if (e.key === 'Escape') {
                    setShowAddIntention(false);
                    setNewIntention('');
                  }
                }}
              />
            </div>
          ) : (
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Focus on high-fidelity architectural time management"
                    className="w-full px-3 py-2 border-b border-gray-200 text-sm text-gray-400"
              onClick={() => setShowAddIntention(true)}
                    readOnly
                  />
                </div>
              )
            )}
            
            {intentionError && (
              <div className="text-xs text-red-600 mb-2">{intentionError}</div>
            )}
                </div>
                
          {/* Daily Objectives */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs uppercase tracking-wider text-gray-700 font-medium">DAILY OBJECTIVES</h2>
              <span className="text-xs text-gray-600">{progressPercentage}%</span>
            </div>
            
          <div className="space-y-3 mb-4">
            {tasks.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No objectives yet</p>
              ) : (
                tasks.map((task) => {
                  const timeSpent = task.time_spent ? Math.round(task.time_spent / 60) : 0;
                  const timeEstimate = task.time_estimate ? Math.round(task.time_estimate / 60) : null;
                  
                  return (
                <div key={task.id} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={task.status === 'completed'}
                    onChange={(e) => handleToggleTask(task.id, e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300"
                  />
                      <span className={`flex-1 text-sm ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                    {task.title}
                  </span>
                      {timeEstimate && (
                        <span className="text-xs text-gray-500">
                          {timeSpent}h / {timeEstimate}h
                        </span>
                      )}
                </div>
                  );
                })
            )}
          </div>

          {showTaskInput ? (
            <form
                onSubmit={(e) => {
                e.preventDefault();
                if (newTask.trim()) {
                    handleAddTask(newTask, newTaskTimeEstimate || null);
                }
              }}
              className="space-y-2"
            >
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                  placeholder="Type an objective..."
                  className="w-full px-3 py-2 border-b border-gray-300 focus:outline-none focus:border-gray-900 text-sm"
                autoFocus
                required
              />
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={newTaskTimeEstimate}
                  onChange={(e) => setNewTaskTimeEstimate(e.target.value)}
                  placeholder="Time (hours)"
                  min="0"
                  step="0.5"
                  className="w-24 px-3 py-2 border-b border-gray-300 focus:outline-none focus:border-gray-900 text-sm"
                />
                <span className="text-xs text-gray-500">hours</span>
                <div className="flex-1"></div>
                <button
                  type="button"
                  onClick={() => {
                    setShowTaskInput(false);
                    setNewTask('');
                    setNewTaskTimeEstimate('');
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700 px-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded hover:bg-gray-800"
                >
                  Add
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowTaskInput(true)}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1.5"
            >
                <span>+</span>
                <span>ADD OBJECTIVE</span>
            </button>
          )}
                  </div>

          {/* Time Allocation */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h2 className="text-xs uppercase tracking-wider text-gray-700 font-medium mb-4">TIME ALLOCATION</h2>
            {pieChartData.length > 0 ? (
              <div className="space-y-4">
                {/* Pie Chart */}
                <div className="flex items-center justify-center">
                  <div className="relative w-48 h-48">
                    <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 192 192">
                      <circle
                        cx="96"
                        cy="96"
                        r="80"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="12"
                      />
                      {(() => {
                        let currentAngle = 0;
                        const radius = 80;
                        const circumference = 2 * Math.PI * radius;
                        return pieChartData.map((item, index) => {
                          const percentage = (item.minutes / totalTimeEstimated);
                          const angle = percentage * 360;
                          const dashLength = (circumference * percentage);
                          const gapLength = circumference - dashLength;
                          const offset = currentAngle * (circumference / 360);
                          currentAngle += angle;
                          return (
                            <circle
                              key={index}
                              cx="96"
                              cy="96"
                              r={radius}
                              fill="none"
                              stroke={item.color}
                              strokeWidth="12"
                              strokeDasharray={`${dashLength} ${gapLength}`}
                              strokeDashoffset={-offset}
                              strokeLinecap="round"
                            />
                          );
                        });
                      })()}
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-medium text-gray-900">
                          {Math.round(totalTimeEstimated / 60 * 10) / 10}h
                        </div>
                        <div className="text-xs text-gray-500">Total</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Legend */}
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {pieChartData.map((item, index) => {
                    const percentage = ((item.minutes / totalTimeEstimated) * 100).toFixed(1);
                    return (
                      <div key={index} className="flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div 
                            className="w-3 h-3 rounded-full flex-shrink-0" 
                            style={{ backgroundColor: item.color }}
                          ></div>
                          <span className="text-gray-700 truncate" title={item.fullName}>
                            {item.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-gray-600">{item.value}h</span>
                          <span className="text-gray-400">({percentage}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm text-gray-400">0%</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500">Add time estimates to tasks to see allocation</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Current Local Time */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 text-center">
            <div className="text-xs uppercase tracking-wider text-gray-500 mb-3">CURRENT LOCAL TIME</div>
            <div className="text-5xl font-light text-gray-900 mb-2 tracking-tight">
              {currentTime}
            </div>
            <div className="text-xs uppercase tracking-wider text-gray-600">
              {currentDate}
            </div>
          </div>

          {/* Schedule */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs uppercase tracking-wider text-gray-700 font-medium">SCHEDULE</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddEvent(true)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Add Event"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                <Link to="/calendar" className="text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </Link>
              </div>
            </div>
            
            {showAddEvent ? (
              <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-200">
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="Event title"
                    className="w-full px-3 py-2 border-b border-gray-300 focus:outline-none focus:border-gray-900 text-sm"
                    autoFocus
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="time"
                      value={newEvent.startTime}
                      onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                      className="w-full px-3 py-2 border-b border-gray-300 focus:outline-none focus:border-gray-900 text-sm"
                    />
                    <input
                      type="time"
                      value={newEvent.endTime}
                      onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                      min={newEvent.startTime || undefined}
                      className="w-full px-3 py-2 border-b border-gray-300 focus:outline-none focus:border-gray-900 text-sm"
                    />
                  </div>
                  {eventError && (
                    <p className="text-xs text-red-600">{eventError}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={handleCreateEvent}
                      disabled={savingEvent || !newEvent.title.trim() || !newEvent.startTime || !newEvent.endTime}
                      className="px-3 py-1.5 text-xs bg-gray-900 text-white rounded hover:bg-gray-800 disabled:opacity-50 transition-colors"
                    >
                      {savingEvent ? 'Adding...' : 'Add'}
                    </button>
                    <button
                      onClick={() => {
                        setShowAddEvent(false);
                        setNewEvent({ title: '', startTime: '', endTime: '', description: '', type: 'event' });
                        setEventError('');
                      }}
                      className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
              </div>
                </div>
              </div>
            ) : null}
            
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {sortedDayKeys.length > 0 ? (
                sortedDayKeys.map((dayKey) => {
                  const dayData = eventsByDay[dayKey];
                  const dayEvents = dayData.events;
                  const isToday = formatDayLabel(dayData.date) === 'TODAY';
                  
                  return (
                    <div key={dayKey} className="space-y-2">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className={`text-xs uppercase tracking-wider font-medium ${isToday ? 'text-gray-900' : 'text-gray-600'}`}>
                          {formatDayLabel(dayData.date)}
                        </h3>
                        {isToday && (
                          <div className="flex-1 h-px bg-gray-200"></div>
                        )}
                      </div>
                      
                      <div className="space-y-2.5 pl-2">
                        {dayEvents.map((event) => {
                          const eventStart = new Date(event.start_time);
                          const eventEnd = new Date(event.end_time);
                          const isActive = eventStart <= now && eventEnd >= now;
                          const isUpcoming = eventStart > now;
                          
                          return (
                            <div key={event.id} className="group flex items-start gap-3 hover:bg-gray-50 -mx-2 px-2 py-1 rounded transition-colors">
                              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                                isActive ? 'bg-green-500' : isUpcoming ? 'bg-gray-400' : 'bg-gray-300'
                              }`}></div>
                              <div className="flex-1 min-w-0">
                                {isActive && (
                                  <div className="text-xs text-green-600 font-medium mb-0.5">ACTIVE NOW</div>
                                )}
                                <div className={`text-sm ${isActive ? 'text-gray-900 font-medium' : 'text-gray-700'}`}>
                                  {event.title}
                                </div>
                                <div className="text-xs text-gray-500 mt-0.5">
                                  {formatEventTime(event.start_time, event.end_time)}
                                </div>
              </div>
                              <button
                                onClick={() => handleDeleteEvent(event.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-600 p-1"
                                title="Delete event"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              ) : (
                !showAddEvent && (
                  <p className="text-xs text-gray-400 text-center py-4">No events scheduled</p>
                )
              )}
            </div>
            
            <Link 
              to="/calendar" 
              className="block mt-4 text-center text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              + VIEW FULL CALENDAR
            </Link>
          </div>

          {/* Thinking Space */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xs uppercase tracking-wider text-gray-700 font-medium">THINKING SPACE</h2>
              <button
                onClick={() => setShowThinkingSpace(!showThinkingSpace)}
                  className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                  {showThinkingSpace ? 'COLLAPSE' : 'EXPAND'}
              </button>
                    </div>
                  </div>

          {showThinkingSpace ? (
            <div className="p-6">
              {todayThoughts.length > 0 && (
                  <div className="mb-5 pb-5 border-b border-gray-100">
                    <h4 className="text-xs font-medium text-gray-600 mb-2">Today's Saved Entries ({todayThoughts.length})</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                    {todayThoughts.map((thought) => (
                        <div key={thought.id} className="p-2.5 bg-gray-50 rounded border border-gray-100">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs text-gray-500 font-medium">
                            {thought.mode === 'freewrite' ? 'Free write' : thought.mode === 'stuck' ? "I'm stuck" : 'Decision draft'}
                          </span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-gray-400">
                              {new Date(thought.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                            </span>
                            <button
                              onClick={() => handleEditThought(thought)}
                                className="p-0.5 text-gray-400 hover:text-gray-600"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteThought(thought.id)}
                                className="p-0.5 text-gray-400 hover:text-gray-600"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                          <p className="text-xs text-gray-700 line-clamp-2">{thought.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {editingThoughtId && (
                  <div className="mb-5 pb-5 border-b border-gray-100">
                    <h4 className="text-xs font-medium text-gray-600 mb-2">Editing Entry</h4>
                    <div className="mb-3 flex gap-2 flex-wrap">
                    {thoughtModes.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setEditingThoughtMode(m.id)}
                          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                          editingThoughtMode === m.id
                              ? 'bg-gray-900 text-white'
                              : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                  <textarea 
                    value={editingThoughtContent}
                    onChange={(e) => setEditingThoughtContent(e.target.value)}
                    placeholder="Edit your thought..."
                      className="w-full h-40 p-3 bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-gray-400 text-gray-700 text-sm leading-relaxed resize-none mb-3"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdateThought}
                      disabled={!editingThoughtContent.trim() || saving}
                        className="px-4 py-1.5 bg-gray-900 text-white rounded text-xs hover:bg-gray-800 disabled:opacity-50 transition-colors"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={() => {
                        setEditingThoughtId(null);
                        setEditingThoughtContent('');
                        setEditingThoughtMode('freewrite');
                      }}
                        className="px-4 py-1.5 bg-gray-50 text-gray-600 rounded text-xs hover:bg-gray-100 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              
              {!editingThoughtId && (
                <>
                    <div className="mb-4 flex gap-2 flex-wrap">
                {thoughtModes.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setThoughtMode(m.id)}
                          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      thoughtMode === m.id
                              ? 'bg-gray-900 text-white'
                              : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
                </div>
                
                <textarea 
                value={thoughtContent}
                onChange={(e) => setThoughtContent(e.target.value)}
                placeholder="Start typing your stream of consciousness here..."
                      className="w-full h-48 p-3 bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-gray-400 text-gray-700 text-sm leading-relaxed resize-none mb-3"
              />

              <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span>{wordCount} words</span>
                        {lastSaved && (
                          <span>Saved {Math.floor((Date.now() - lastSaved) / 60000)}m ago</span>
                        )}
                </div>
                <button
                  onClick={handleSaveThought}
                  disabled={!thoughtContent.trim() || saving}
                        className="px-4 py-1.5 bg-gray-900 text-white rounded text-xs hover:bg-gray-800 disabled:opacity-50 transition-colors flex items-center gap-1.5"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Save</span>
                </button>
              </div>
                </>
              )}
              
              {saved && (
                  <div className="mt-3 p-2 text-xs text-gray-600 text-center">
                    Saved successfully
                </div>
              )}
              {thoughtError && (
                  <div className="mt-3 p-2 text-xs text-red-600 text-center">
                    {thoughtError}
                </div>
              )}
            </div>
          ) : (
            <div className="p-6">
              {todayThoughts.length > 0 ? (
                  <div className="space-y-2 mb-3">
                    <p className="text-xs text-gray-500 mb-3">Today's entries:</p>
                  {todayThoughts.slice(0, 3).map((thought) => (
                      <div key={thought.id} className="p-2.5 bg-gray-50 rounded border border-gray-100">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs text-gray-500 font-medium">
                          {thought.mode === 'freewrite' ? 'Free write' : thought.mode === 'stuck' ? "I'm stuck" : 'Decision draft'}
                        </span>
                          <span className="text-xs text-gray-400">
                          {new Date(thought.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </span>
                      </div>
                        <p className="text-xs text-gray-700 line-clamp-2">{thought.content}</p>
                    </div>
                  ))}
                  {todayThoughts.length > 3 && (
                      <p className="text-xs text-gray-400 text-center">+{todayThoughts.length - 3} more entries</p>
                  )}
                </div>
              ) : (
                  <div className="text-center mb-3">
                    <p className="text-xs text-gray-500 italic mb-3">Need to process your thoughts? Capture the whispers of your mind here.</p>
                </div>
              )}
              <button
                onClick={() => setShowThinkingSpace(true)}
                  className="w-full px-4 py-2 bg-gray-900 text-white rounded text-xs hover:bg-gray-800 transition-colors"
              >
                  {todayThoughts.length > 0 ? 'CONTINUE WRITING' : 'START WRITING'}
              </button>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
