import { useState, useEffect, useRef } from 'react';
import { format, startOfWeek, addDays, addWeeks, subWeeks, startOfDay, addHours, isSameDay, isToday, isPast, setHours, setMinutes, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameWeek, startOfYear, endOfYear, eachWeekOfInterval, getWeek } from 'date-fns';
import { useAuth } from '../context/AuthContext';

export default function Calendar() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('day'); // 'day' | 'week' | 'month' | 'timeline'
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [quickAddSlot, setQuickAddSlot] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [draggedEvent, setDraggedEvent] = useState(null);
  const [dragStartY, setDragStartY] = useState(null);
  const [dragStartTime, setDragStartTime] = useState(null);
  const [resizingEvent, setResizingEvent] = useState(null);
  const [resizeStartY, setResizeStartY] = useState(null);
  const [resizeType, setResizeType] = useState(null); // 'top' or 'bottom'
  const [justDragged, setJustDragged] = useState(false);
  const [justResized, setJustResized] = useState(false);
  const [creatingRange, setCreatingRange] = useState(null);
  const [rangeStart, setRangeStart] = useState(null);
  const [newEventData, setNewEventData] = useState({
    title: '',
    type: 'event',
    description: '',
    color: '#3B6E5C',
    startTime: '',
    endTime: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    reminder_minutes: null,
    recurrence_freq: 'none',
    recurrence_end_date: '',
    recurrence_count: ''
  });
  const [loading, setLoading] = useState(true);
  const [editFormData, setEditFormData] = useState({});
  const [showEventDetail, setShowEventDetail] = useState(false);

  // Time slots (full day - 24 hours)
  const timeSlots = Array.from({ length: 24 }, (_, i) => i);

  // Event type colors
  const typeColors = {
    event: '#3B6E5C',
    task: '#4A90E2',
    note: '#F5A623',
    reminder: '#FF6B6B'
  };

  // Fetch events from API
  const fetchEvents = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      let start, end;
      
      if (view === 'day') {
        start = startOfDay(currentDate);
        end = addHours(start, 24);
      } else if (view === 'week') {
        start = startOfWeek(currentDate, { weekStartsOn: 1 });
        end = addDays(start, 7);
      } else if (view === 'month') {
        start = startOfMonth(currentDate);
        end = endOfMonth(currentDate);
      } else {
        start = startOfWeek(currentDate, { weekStartsOn: 1 });
        end = addDays(start, 7);
      }
      
      const response = await fetch(
        `/api/calendar/events?start_date=${start.toISOString()}&end_date=${end.toISOString()}`,
        { credentials: 'include' }
      );
      
      if (response.ok) {
        const data = await response.json();
        const baseEvents = data.events || [];
        // Expand recurring events for display
        const expanded = expandRecurringEvents(baseEvents, start, end);
        setEvents(expanded);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [currentDate, view, user]);

  // Get week dates
  const getWeekDates = () => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const weekDates = getWeekDates();

  // Navigation
  const handlePrev = () => {
    if (view === 'week') {
      setCurrentDate(subWeeks(currentDate, 1));
    } else if (view === 'day') {
      setCurrentDate(addDays(currentDate, -1));
    } else if (view === 'month') {
      setCurrentDate(addDays(currentDate, -30));
    }
  };

  const handleNext = () => {
    if (view === 'week') {
      setCurrentDate(addWeeks(currentDate, 1));
    } else if (view === 'day') {
      setCurrentDate(addDays(currentDate, 1));
    } else if (view === 'month') {
      setCurrentDate(addDays(currentDate, 30));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Get events for a specific day
  const getEventsForDay = (date) => {
    return events.filter(event => {
      const eventStart = new Date(event.start_time);
      return isSameDay(eventStart, date);
    }).sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
  };

  // Calculate event position in pixels (60px per hour)
  const getEventStyle = (event) => {
    const start = new Date(event.start_time);
    const end = new Date(event.end_time);
    
    const startHour = start.getHours();
    const startMinutes = start.getMinutes();
    const endHour = end.getHours();
    const endMinutes = end.getMinutes();
    
    // Calculate position from midnight (0:00)
    const startOffset = startHour * 60 + startMinutes;
    const duration = (endHour - startHour) * 60 + (endMinutes - startMinutes);
    
    return { 
      top: `${startOffset}px`, 
      height: `${Math.max(duration, 24)}px`,
      minHeight: '24px'
    };
  };

  // Handle time slot click - start creating range
  const handleSlotMouseDown = (date, hour, e) => {
    e.preventDefault();
    const slotDate = setMinutes(setHours(startOfDay(date), hour), 0);
    setRangeStart({ date: slotDate, hour });
    setCreatingRange({ start: slotDate, end: addHours(slotDate, 1), date, startHour: hour });
  };

  // Global mouse move handler for range creation
  useEffect(() => {
    if (!rangeStart) return;
    
    const handleGlobalMouseMove = (e) => {
      const dayColumns = document.querySelectorAll('.day-column-resize');
      if (dayColumns.length === 0) return;
      
      // Find which day column and hour the mouse is over
      dayColumns.forEach((column) => {
        const rect = column.getBoundingClientRect();
        if (e.clientY >= rect.top && e.clientY <= rect.top + (timeSlots.length * 60)) {
          const relativeY = e.clientY - rect.top;
          const hour = Math.floor(relativeY / 60); // 0-23 for full day
          
          if (hour >= 0 && hour <= 23) {
            const dateStr = column.getAttribute('data-date');
            if (dateStr) {
              const date = new Date(dateStr);
              const currentSlot = setMinutes(setHours(startOfDay(date), hour), 0);
              const startSlot = rangeStart.date;
              
              let newStart, newEnd;
              if (currentSlot < startSlot) {
                newStart = currentSlot;
                newEnd = addHours(startSlot, 1);
              } else {
                newStart = startSlot;
                newEnd = addHours(currentSlot, 1);
              }
              
              setCreatingRange({
                start: newStart,
                end: newEnd,
                date: date,
                startHour: rangeStart.hour
              });
            }
          }
        }
      });
    };
    
    const handleGlobalMouseUp = (e) => {
      if (creatingRange) {
        setQuickAddSlot({
          date: creatingRange.start,
          endDate: creatingRange.end,
          hour: rangeStart.hour
        });
        
        const startHour = creatingRange.start.getHours();
        const startMin = creatingRange.start.getMinutes();
        const endHour = creatingRange.end.getHours();
        const endMin = creatingRange.end.getMinutes();
        
        setNewEventData({
          title: '',
          type: 'event',
          description: '',
          color: typeColors.event,
          startTime: `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`,
          endTime: `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`
        });
      }
      
      setCreatingRange(null);
      setRangeStart(null);
    };
    
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [rangeStart, creatingRange, timeSlots]);


  // Handle simple click (fallback)
  const handleSlotClick = (date, hour) => {
    if (creatingRange) return; // Don't open modal if we're creating a range
    
    const slotDate = setMinutes(setHours(startOfDay(date), hour), 0);
    const endDate = addHours(slotDate, 1);
    
    setQuickAddSlot({
      date: slotDate,
      endDate: endDate,
      hour: hour
    });
    
    setNewEventData({
      title: '',
      type: 'event',
      description: '',
      color: typeColors.event,
      startTime: `${hour.toString().padStart(2, '0')}:00`,
      endTime: `${(hour + 1).toString().padStart(2, '0')}:00`
    });
  };

  // Parse time string to date
  const parseTimeToDate = (date, timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return setMinutes(setHours(startOfDay(date), hours), minutes);
  };

  // Create new event
  const handleCreateEvent = async () => {
    if (!newEventData.title.trim() || !quickAddSlot) return;
    
    // Use custom times if provided, otherwise use slot times
    let startTime, endTime;
    if (newEventData.startTime && newEventData.endTime) {
      startTime = parseTimeToDate(quickAddSlot.date, newEventData.startTime);
      endTime = parseTimeToDate(quickAddSlot.date, newEventData.endTime);
      
      // Ensure end is after start
      if (endTime <= startTime) {
        endTime = addHours(startTime, 1);
      }
    } else {
      startTime = quickAddSlot.date;
      endTime = quickAddSlot.endDate;
    }
    
    try {
      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: newEventData.title.trim(),
          description: newEventData.description || null,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          type: newEventData.type,
          color: newEventData.color,
          timezone: newEventData.timezone,
          reminder_minutes: newEventData.reminder_minutes || null,
          recurrence_rule: newEventData.recurrence_freq !== 'none' ? {
            freq: newEventData.recurrence_freq,
            interval: 1
          } : null,
          recurrence_end_date: newEventData.recurrence_end_date || null,
          recurrence_count: newEventData.recurrence_count ? parseInt(newEventData.recurrence_count) : null
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setEvents([...events, data.event]);
        setQuickAddSlot(null);
        setNewEventData({ 
          title: '', 
          type: 'event', 
          description: '', 
          color: typeColors.event,
          startTime: '',
          endTime: '',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          reminder_minutes: null,
          recurrence_freq: 'none',
          recurrence_end_date: '',
          recurrence_count: ''
        });
        setCreatingRange(null);
        setRangeStart(null);
      }
    } catch (error) {
        console.error('Failed to create event:', error);
        alert('Failed to create event');
    }
  };

  // Update event
  const handleUpdateEvent = async () => {
    if (!editingEvent || !editFormData.title?.trim()) return;
    
    try {
      const response = await fetch(`/api/calendar/events/${editingEvent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editFormData),
      });
      
      if (response.ok) {
        const data = await response.json();
        fetchEvents(); // Refresh to get updated events
        setEditingEvent(null);
        setEditFormData({});
        setSelectedEvent(null);
        setShowEventDetail(false);
      }
    } catch (error) {
      console.error('Failed to update event:', error);
      alert('Failed to update event');
    }
  };

  // Delete event
  const handleDeleteEvent = async (eventId) => {
    // If it's a recurring instance, get the original event ID
    const event = events.find(e => e.id === eventId);
    const actualEventId = event?.originalEventId || eventId;
    
    if (!confirm('Delete this event?')) return;
    
    try {
      const response = await fetch(`/api/calendar/events/${actualEventId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (response.ok) {
        setEvents(events.filter(e => e.id !== actualEventId && e.originalEventId !== actualEventId));
        setSelectedEvent(null);
        setEditingEvent(null);
        setShowEventDetail(false);
        fetchEvents();
      }
    } catch (error) {
      console.error('Failed to delete event:', error);
      alert('Failed to delete event');
    }
  };

  // Duplicate event
  const handleDuplicateEvent = async (event) => {
    try {
      const start = new Date(event.start_time);
      const end = new Date(event.end_time);
      const duration = end - start;
      const newStart = addDays(start, 1);
      const newEnd = new Date(newStart.getTime() + duration);
      
      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: `${event.title} (Copy)`,
          description: event.description || null,
          start_time: newStart.toISOString(),
          end_time: newEnd.toISOString(),
          type: event.type,
          color: event.color,
          timezone: event.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
          reminder_minutes: event.reminder_minutes || null,
          recurrence_rule: event.recurrence_rule ? (typeof event.recurrence_rule === 'string' ? JSON.parse(event.recurrence_rule) : event.recurrence_rule) : null,
          recurrence_end_date: event.recurrence_end_date || null,
          recurrence_count: event.recurrence_count || null
        }),
      });
      
      if (response.ok) {
        fetchEvents();
        setShowEventDetail(false);
        setSelectedEvent(null);
      }
    } catch (error) {
      console.error('Failed to duplicate event:', error);
      alert('Failed to duplicate event');
    }
  };

  // Export events to ICS
  const handleExportEvents = async () => {
    try {
      const response = await fetch('/api/calendar/events', {
        credentials: 'include'
      });
      
      if (!response.ok) return;
      
      const data = await response.json();
      const allEvents = data.events || [];
      
      // Generate ICS content
      let icsContent = 'BEGIN:VCALENDAR\n';
      icsContent += 'VERSION:2.0\n';
      icsContent += 'PRODID:-//OFA//Calendar//EN\n';
      icsContent += 'CALSCALE:GREGORIAN\n';
      
      allEvents.forEach(event => {
        icsContent += 'BEGIN:VEVENT\n';
        icsContent += `UID:${event.id}@ofa\n`;
        icsContent += `DTSTART:${format(new Date(event.start_time), 'yyyyMMdd')}T${format(new Date(event.start_time), 'HHmmss')}\n`;
        icsContent += `DTEND:${format(new Date(event.end_time), 'yyyyMMdd')}T${format(new Date(event.end_time), 'HHmmss')}\n`;
        icsContent += `SUMMARY:${event.title.replace(/,/g, '\\,').replace(/;/g, '\\;')}\n`;
        if (event.description) {
          icsContent += `DESCRIPTION:${event.description.replace(/,/g, '\\,').replace(/;/g, '\\;')}\n`;
        }
        icsContent += `END:VEVENT\n`;
      });
      
      icsContent += 'END:VCALENDAR\n';
      
      // Download file
      const blob = new Blob([icsContent], { type: 'text/calendar' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ofa-calendar-${format(new Date(), 'yyyy-MM-dd')}.ics`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export events:', error);
      alert('Failed to export events');
    }
  };

  // Move event (for drag)
  const handleMoveEvent = async (eventId, newStartTime, newEndTime) => {
    try {
      const response = await fetch(`/api/calendar/events/${eventId}/move`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          start_time: newStartTime.toISOString(),
          end_time: newEndTime.toISOString(),
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setEvents(events.map(e => e.id === eventId ? data.event : e));
      }
    } catch (error) {
      console.error('Failed to move event:', error);
      fetchEvents();
    }
  };

  // Handle event drag start (mouse-based)
  const handleEventMouseDown = (event, e) => {
    // Don't start drag if clicking on resize handle
    if (e.target.classList.contains('resize-handle')) return;
    
    e.preventDefault();
    e.stopPropagation();
    setDraggedEvent(event);
    setDragStartY(e.clientY);
    setDragStartTime(new Date(event.start_time));
    setSelectedEvent(null);
  };

  // Global mouse move handler for dragging events
  useEffect(() => {
    if (!draggedEvent || dragStartY === null) return;
    
    const handleGlobalMouseMove = (e) => {
      const dayColumns = document.querySelectorAll('.day-column-resize');
      if (dayColumns.length === 0) return;
      
      dayColumns.forEach((column) => {
        const rect = column.getBoundingClientRect();
        if (e.clientY >= rect.top && e.clientY <= rect.top + (timeSlots.length * 60)) {
          const relativeY = e.clientY - rect.top;
          const slotHeight = 60;
          const hours = Math.floor(relativeY / slotHeight);
          const minutes = Math.floor((relativeY % slotHeight) / slotHeight * 60);
          
          const dateStr = column.getAttribute('data-date');
          if (dateStr) {
            const date = new Date(dateStr);
            const newStart = setMinutes(setHours(startOfDay(date), hours), minutes);
            const duration = new Date(draggedEvent.end_time) - new Date(draggedEvent.start_time);
            const newEnd = new Date(newStart.getTime() + duration);
            
            // Optimistic update
            setEvents(prevEvents => prevEvents.map(ev => 
              ev.id === draggedEvent.id 
                ? { ...ev, start_time: newStart.toISOString(), end_time: newEnd.toISOString() }
                : ev
            ));
          }
        }
      });
    };
    
    const handleGlobalMouseUp = async (e) => {
      if (!draggedEvent) return;
      
      const dayColumns = document.querySelectorAll('.day-column-resize');
      let moved = false;
      
      for (const column of dayColumns) {
        const rect = column.getBoundingClientRect();
        if (e.clientY >= rect.top && e.clientY <= rect.top + (timeSlots.length * 60)) {
          const relativeY = e.clientY - rect.top;
          const slotHeight = 60;
          const hours = Math.floor(relativeY / slotHeight);
          const minutes = Math.floor((relativeY % slotHeight) / slotHeight * 60);
          
          const dateStr = column.getAttribute('data-date');
          if (dateStr) {
            const date = new Date(dateStr);
            const newStart = setMinutes(setHours(startOfDay(date), hours), minutes);
            const duration = new Date(draggedEvent.end_time) - new Date(draggedEvent.start_time);
            const newEnd = new Date(newStart.getTime() + duration);
            
            handleMoveEvent(draggedEvent.id, newStart, newEnd);
            moved = true;
            break; // Only process first matching column
          }
        }
      }
      
      if (!moved) {
        // Revert to original position if dropped outside
        fetchEvents();
      } else {
        // Prevent click event from firing after drag
        setJustDragged(true);
        setTimeout(() => setJustDragged(false), 100);
      }
      
      setDraggedEvent(null);
      setDragStartY(null);
      setDragStartTime(null);
    };
    
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [draggedEvent, dragStartY, dragStartTime, timeSlots]);

  // Handle resize start
  const handleResizeStart = (event, e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingEvent(event);
    setResizeStartY(e.clientY);
    setResizeType(type); // 'top' or 'bottom'
  };

  // Handle resize (global mouse move)
  useEffect(() => {
    if (!resizingEvent || !resizeType) return;
    
    const handleGlobalMouseMove = (e) => {
      const dayColumns = document.querySelectorAll('.day-column-resize');
      if (dayColumns.length === 0) return;
      
      dayColumns.forEach((column) => {
        const rect = column.getBoundingClientRect();
        if (e.clientY >= rect.top && e.clientY <= rect.top + (timeSlots.length * 60)) {
          const relativeY = e.clientY - rect.top;
          const slotHeight = 60;
          const hours = Math.floor(relativeY / slotHeight);
          const minutes = Math.floor((relativeY % slotHeight) / slotHeight * 60);
          
          const dateStr = column.getAttribute('data-date');
          if (dateStr) {
            const date = new Date(dateStr);
            let newTime = setMinutes(setHours(startOfDay(date), hours), minutes);
            // Snap to 15-minute intervals
            newTime = snapTimeToInterval(newTime, 15);
            const start = new Date(resizingEvent.start_time);
            const end = new Date(resizingEvent.end_time);
            
            if (resizeType === 'bottom') {
              // Resize from bottom - change end time
              if (newTime > start) {
                setEvents(prevEvents => prevEvents.map(ev => 
                  ev.id === resizingEvent.id 
                    ? { ...ev, end_time: newTime.toISOString() }
                    : ev
                ));
              }
            } else if (resizeType === 'top') {
              // Resize from top - change start time
              if (newTime < end) {
                setEvents(prevEvents => prevEvents.map(ev => 
                  ev.id === resizingEvent.id 
                    ? { ...ev, start_time: newTime.toISOString() }
                    : ev
                ));
              }
            }
          }
        }
      });
    };

    const handleGlobalMouseUp = async (e) => {
      if (!resizingEvent) return;
      
      const dayColumns = document.querySelectorAll('.day-column-resize');
      let resized = false;
      
      for (const column of dayColumns) {
        const rect = column.getBoundingClientRect();
        if (e.clientY >= rect.top && e.clientY <= rect.top + (timeSlots.length * 60)) {
          const relativeY = e.clientY - rect.top;
          const slotHeight = 60;
          const hours = Math.floor(relativeY / slotHeight);
          const minutes = Math.floor((relativeY % slotHeight) / slotHeight * 60);
          
          const dateStr = column.getAttribute('data-date');
          if (dateStr) {
            const date = new Date(dateStr);
            let newTime = setMinutes(setHours(startOfDay(date), hours), minutes);
            // Snap to 15-minute intervals
            newTime = snapTimeToInterval(newTime, 15);
            const start = new Date(resizingEvent.start_time);
            const end = new Date(resizingEvent.end_time);
            
            try {
              if (resizeType === 'bottom' && newTime > start) {
                const response = await fetch(`/api/calendar/events/${resizingEvent.id}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({
                    end_time: newTime.toISOString()
                  }),
                });
                
                if (response.ok) {
                  const data = await response.json();
                  setEvents(prevEvents => prevEvents.map(ev => ev.id === resizingEvent.id ? data.event : ev));
                  resized = true;
                  break;
                }
              } else if (resizeType === 'top' && newTime < end) {
                const response = await fetch(`/api/calendar/events/${resizingEvent.id}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({
                    start_time: newTime.toISOString()
                  }),
                });
                
                if (response.ok) {
                  const data = await response.json();
                  setEvents(prevEvents => prevEvents.map(ev => ev.id === resizingEvent.id ? data.event : ev));
                  resized = true;
                  break;
                }
              }
            } catch (error) {
              console.error('Failed to resize event:', error);
              fetchEvents();
            }
            break; // Only process first matching column
          }
        }
      }
      
      if (!resized) {
        // Revert if resize failed
        fetchEvents();
      } else {
        // Prevent click event from firing after resize
        setJustResized(true);
        setTimeout(() => setJustResized(false), 100);
      }
      
      setResizingEvent(null);
      setResizeStartY(null);
      setResizeType(null);
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [resizingEvent, resizeStartY, resizeType, timeSlots]);



  // Snap time to 15-minute intervals
  const snapTimeToInterval = (date, intervalMinutes = 15) => {
    const minutes = date.getMinutes();
    const snappedMinutes = Math.round(minutes / intervalMinutes) * intervalMinutes;
    return setMinutes(date, snappedMinutes);
  };

  // Expand recurring events for display
  const expandRecurringEvents = (events, startDate, endDate) => {
    const expanded = [];
    
    events.forEach(event => {
      if (!event.recurrence_rule) {
        expanded.push(event);
        return;
      }
      
      try {
        const rule = typeof event.recurrence_rule === 'string' 
          ? JSON.parse(event.recurrence_rule) 
          : event.recurrence_rule;
        
        if (!rule.freq) {
          expanded.push(event);
          return;
        }
        
        const start = new Date(event.start_time);
        const end = new Date(event.end_time);
        const duration = end - start;
        
        let current = new Date(start);
        let count = 0;
        const maxCount = event.recurrence_count || 1000;
        const endDateLimit = event.recurrence_end_date 
          ? new Date(event.recurrence_end_date) 
          : null;
        
        // Add the original event first
        if (start >= startDate && start <= endDate) {
          expanded.push({
            ...event,
            isRecurringInstance: false
          });
        }
        
        // Generate recurring instances
        while (current <= endDate && count < maxCount) {
          // Advance based on frequency first
          if (rule.freq === 'daily') {
            current = addDays(current, rule.interval || 1);
          } else if (rule.freq === 'weekly') {
            current = addDays(current, (rule.interval || 1) * 7);
          } else if (rule.freq === 'monthly') {
            current = addDays(current, (rule.interval || 1) * 30);
          } else {
            break;
          }
          
          if (endDateLimit && current > endDateLimit) break;
          if (current > endDate) break;
          
          if (current >= startDate) {
            expanded.push({
              ...event,
              id: `${event.id}_${count}`,
              start_time: current.toISOString(),
              end_time: new Date(current.getTime() + duration).toISOString(),
              isRecurringInstance: true,
              originalEventId: event.id
            });
          }
          
          count++;
        }
      } catch (error) {
        console.error('Error expanding recurring event:', error);
        expanded.push(event);
      }
    });
    
    return expanded;
  };

  // Format time for display
  const formatTime = (dateString) => {
    return format(new Date(dateString), 'h:mm a');
  };

  // Get event color
  const getEventColor = (event) => {
    return event.color || typeColors[event.type] || typeColors.event;
  };

  // Render event block
  const renderEvent = (event) => {
    const color = getEventColor(event);
    const style = getEventStyle(event);
    const isDragging = draggedEvent?.id === event.id;
    const isResizing = resizingEvent?.id === event.id;
    
    return (
      <div
        key={event.id}
        className={`absolute left-1 right-1 rounded-lg px-2 py-1 text-xs cursor-move hover:shadow-lg transition-all z-10 overflow-hidden group ${
          isDragging ? 'opacity-75 shadow-xl' : ''
        } ${isResizing ? 'ring-2 ring-gray-400' : ''}`}
        style={{
          ...style,
          backgroundColor: color,
          color: 'white',
          borderLeft: `3px solid ${color}`,
        }}
        onMouseDown={(e) => handleEventMouseDown(event, e)}
        onClick={(e) => {
          // Don't open edit panel if we just finished dragging/resizing
          if (isDragging || isResizing || justDragged || justResized) {
            e.stopPropagation();
            return;
          }
          e.stopPropagation();
          setSelectedEvent(event);
          setShowEventDetail(true);
        }}
        title={`${event.title} - ${formatTime(event.start_time)} to ${formatTime(event.end_time)}`}
      >
        <div className="font-medium truncate">{event.title}</div>
        <div className="text-white/90 text-[10px] mt-0.5">
          {formatTime(event.start_time)} - {formatTime(event.end_time)}
        </div>
        {/* Top resize handle */}
        <div
          className="resize-handle absolute top-0 left-0 right-0 h-3 cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 hover:bg-white/40"
          onMouseDown={(e) => {
            e.stopPropagation();
            handleResizeStart(event, e, 'top');
          }}
        />
        {/* Bottom resize handle */}
        <div
          className="resize-handle absolute bottom-0 left-0 right-0 h-3 cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 hover:bg-white/40"
          onMouseDown={(e) => {
            e.stopPropagation();
            handleResizeStart(event, e, 'bottom');
          }}
        />
      </div>
    );
  };

  // Render Day View
  const renderDayView = () => {
    const dayEvents = getEventsForDay(currentDate);
    
    return (
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="grid grid-cols-2 max-h-[calc(100vh-300px)] overflow-y-auto">
          {/* Time Column */}
          <div className="border-r border-gray-200 bg-gray-50 sticky top-0">
            {timeSlots.map((hour) => (
              <div
                key={hour}
                className="h-[60px] border-b border-gray-200 flex items-start justify-end pr-4 pt-2"
              >
                <span className="text-xs text-gray-600 font-medium">
                  {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                </span>
              </div>
            ))}
          </div>

          {/* Day Column */}
          <div
            className="relative day-column-resize"
            data-date={currentDate.toISOString()}
          >
            {timeSlots.map((hour) => {
              const slotStart = setMinutes(setHours(startOfDay(currentDate), hour), 0);
              const slotEnd = addHours(slotStart, 1);
              const isInRange = creatingRange && 
                creatingRange.start < slotEnd && 
                creatingRange.end > slotStart &&
                isSameDay(creatingRange.date || currentDate, currentDate);
              
              return (
                <div
                  key={hour}
                  className="h-[60px] border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors relative group"
                  onMouseDown={(e) => handleSlotMouseDown(currentDate, hour, e)}
                  onClick={() => {
                    if (!rangeStart) {
                      handleSlotClick(currentDate, hour);
                    }
                  }}
                >
                  {/* Show creating range preview */}
                  {isInRange && (
                    <div 
                      className="absolute left-0 right-0 bg-black/20 border-2 border-gray-900 rounded pointer-events-none z-0"
                      style={{
                        top: '0',
                        height: '100%'
                      }}
                    />
                  )}
                  {/* Hour indicator on hover */}
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-gray-400">
                    {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                  </div>
                </div>
              );
            })}
            {dayEvents.map(event => renderEvent(event))}
          </div>
        </div>
      </div>
    );
  };

  // Render Week View
  const renderWeekView = () => {
    return (
      <div className="bg-white rounded-2xl border border-gray-300 overflow-hidden shadow-sm">
        {/* Days Header */}
        <div className="grid grid-cols-8 border-b border-gray-300 bg-gray-100/50">
          <div className="p-4 border-r border-gray-300"></div>
          {weekDates.map((date, index) => {
            const isTodayDate = isToday(date);
            return (
              <div
                key={index}
                className={`p-4 text-center border-r border-gray-300 last:border-r-0 ${
                  isTodayDate ? 'bg-black/10' : ''
                }`}
              >
                <div className="text-xs text-gray-500 mb-1 uppercase">
                  {format(date, 'EEE')}
                </div>
                <div className={`text-lg font-medium ${
                  isTodayDate ? 'text-black' : 'text-black'
                }`}>
                  {format(date, 'd')}
                </div>
              </div>
            );
          })}
        </div>

        {/* Time Slots */}
        <div className="grid grid-cols-8 relative max-h-[calc(100vh-300px)] overflow-y-auto">
          {/* Time Column */}
          <div className="border-r border-gray-200 bg-gray-50 sticky top-0">
            {timeSlots.map((hour) => (
              <div
                key={hour}
                className="h-[60px] border-b border-gray-200 flex items-start justify-end pr-4 pt-2"
              >
                <span className="text-xs text-gray-600 font-medium">
                  {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                </span>
              </div>
            ))}
          </div>

          {/* Day Columns */}
          {weekDates.map((date, dayIndex) => {
            const dayEvents = getEventsForDay(date);
            return (
              <div
                key={dayIndex}
                className="border-r border-gray-200 last:border-r-0 relative day-column-resize"
                data-date={date.toISOString()}
              >
                {timeSlots.map((hour) => {
                  const slotStart = setMinutes(setHours(startOfDay(date), hour), 0);
                  const slotEnd = addHours(slotStart, 1);
                  const isInRange = creatingRange && 
                    creatingRange.start < slotEnd && 
                    creatingRange.end > slotStart &&
                    isSameDay(creatingRange.date || date, date);
                  
                  return (
                    <div
                      key={hour}
                      className="h-[60px] border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors relative group"
                      onMouseDown={(e) => handleSlotMouseDown(date, hour, e)}
                      onClick={() => {
                        if (!rangeStart) {
                          handleSlotClick(date, hour);
                        }
                      }}
                    >
                      {/* Show creating range preview */}
                      {isInRange && (
                        <div 
                          className="absolute left-0 right-0 bg-black/20 border-2 border-gray-900 rounded pointer-events-none z-0"
                          style={{
                            top: '0',
                            height: '100%'
                          }}
                        />
                      )}
                    </div>
                  );
                })}
                {dayEvents.map(event => renderEvent(event))}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render Month View
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const firstDay = monthStart.getDay();
    const paddingDays = firstDay === 0 ? 6 : firstDay - 1; // Monday = 0
    
    return (
      <div className="bg-white rounded-2xl border border-gray-300 overflow-hidden shadow-sm">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-gray-300 bg-gray-100/50">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div key={day} className="p-3 text-center text-xs font-medium text-gray-600 uppercase border-r border-gray-300 last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {/* Padding days */}
          {Array.from({ length: paddingDays }).map((_, i) => (
            <div key={`pad-${i}`} className="h-24 border-b border-r border-gray-300 bg-gray-100/20"></div>
          ))}
          
          {/* Actual days */}
          {days.map((date) => {
            const dayEvents = getEventsForDay(date);
            const isTodayDate = isToday(date);
            return (
              <div
                key={date.toISOString()}
                className={`h-24 border-b border-r border-gray-300 last:border-r-0 p-2 ${
                  isTodayDate ? 'bg-black/5' : ''
                }`}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isTodayDate ? 'text-black' : 'text-black'
                }`}>
                  {format(date, 'd')}
                </div>
                <div className="space-y-0.5 overflow-hidden">
                  {dayEvents.slice(0, 3).map(event => (
                    <div
                      key={event.id}
                      className="text-[10px] px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-80"
                      style={{
                        backgroundColor: getEventColor(event),
                        color: 'white'
                      }}
                      onClick={() => {
                        setSelectedEvent(event);
                        setEditingEvent(event);
                        setEditFormData({
                          title: event.title,
                          description: event.description || '',
                          type: event.type,
                          color: event.color || typeColors[event.type]
                        });
                      }}
                      title={event.title}
                    >
                      {formatTime(event.start_time)} {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-[10px] text-gray-600 px-1">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render Timeline View
  const renderTimelineView = () => {
    const weekEvents = events
      .filter(event => {
        const eventStart = new Date(event.start_time);
        return weekDates.some(date => isSameDay(eventStart, date));
      })
      .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

    return (
      <div className="bg-white rounded-2xl border border-gray-300 overflow-hidden shadow-sm p-6">
        <h3 className="font-display text-xl text-black mb-4">Timeline</h3>
        <div className="space-y-3">
          {weekEvents.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No events planned for this week</p>
          ) : (
            weekEvents.map(event => {
              const start = new Date(event.start_time);
              const end = new Date(event.end_time);
              const color = getEventColor(event);
              
              return (
                <div
                  key={event.id}
                  className="flex items-start gap-4 p-4 rounded-lg border border-gray-300 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    setSelectedEvent(event);
                    setEditingEvent(event);
                    setEditFormData({
                      title: event.title,
                      description: event.description || '',
                      type: event.type,
                      color: event.color || typeColors[event.type]
                    });
                  }}
                >
                  <div
                    className="w-1 h-12 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color }}
                  ></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-medium text-black">{event.title}</h4>
                      <span className="text-xs text-gray-600 capitalize">{event.type}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {format(start, 'EEEE, MMM d')} • {formatTime(event.start_time)} - {formatTime(event.end_time)}
                    </p>
                    {event.description && (
                      <p className="text-sm text-gray-500 line-clamp-2">{event.description}</p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="text-center text-gray-600">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-3xl text-black">Calendar</h1>
          
          <div className="flex items-center gap-4">
            <button
              onClick={handleExportEvents}
              className="px-4 py-2 bg-white border border-gray-300 text-black rounded-lg hover:bg-gray-100 transition-colors text-sm"
              title="Export to ICS"
            >
              Export
            </button>
            <button
              onClick={handlePrev}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ←
            </button>
            <div className="flex items-center gap-3">
              <span className="font-medium text-black min-w-[200px] text-center">
                {view === 'week' && format(currentDate, 'MMMM yyyy')}
                {view === 'day' && format(currentDate, 'EEEE, MMMM d, yyyy')}
                {view === 'month' && format(currentDate, 'MMMM yyyy')}
                {view === 'timeline' && `Week of ${format(weekDates[0], 'MMM d')}`}
              </span>
              <button
                onClick={handleToday}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-black transition-colors text-sm"
              >
                Today
              </button>
            </div>
            <button
              onClick={handleNext}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              →
            </button>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2">
          {['day', 'week', 'month', 'timeline'].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-2 rounded-lg transition-colors text-sm capitalize ${
                view === v
                  ? 'bg-black text-white'
                  : 'bg-white border border-gray-300 text-black hover:bg-gray-100'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Views */}
      {view === 'day' && renderDayView()}
      {view === 'week' && renderWeekView()}
      {view === 'month' && renderMonthView()}
      {view === 'timeline' && renderTimelineView()}

      {/* Quick Add Modal */}
      {quickAddSlot && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={() => {
            setQuickAddSlot(null);
            setNewEventData({ 
              title: '', 
              type: 'event', 
              description: '', 
              color: typeColors.event, 
              startTime: '', 
              endTime: '',
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              reminder_minutes: null,
              recurrence_freq: 'none',
              recurrence_end_date: '',
              recurrence_count: ''
            });
            setCreatingRange(null);
            setRangeStart(null);
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-xl text-black mb-2">New Entry</h3>
            <p className="text-xs text-gray-600 mb-4">💡 Tip: Click and drag on time slots to select a time range</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(typeColors).map(([type, color]) => (
                    <button
                      key={type}
                      onClick={() => setNewEventData({ ...newEventData, type, color })}
                      className={`px-3 py-2 rounded-lg text-sm capitalize transition-colors ${
                        newEventData.type === type
                          ? 'ring-2 ring-ofa-ink'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                      style={{
                        backgroundColor: newEventData.type === type ? color : undefined,
                        color: newEventData.type === type ? 'white' : undefined
                      }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-2">Title</label>
                <input
                  type="text"
                  value={newEventData.title}
                  onChange={(e) => setNewEventData({ ...newEventData, title: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateEvent()}
                  placeholder="Entry title..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-ofa-ink"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-2">Start Time</label>
                <input
                  type="time"
                  value={newEventData.startTime}
                  onChange={(e) => {
                    setNewEventData({ ...newEventData, startTime: e.target.value });
                    // Auto-update end time if it's before start time
                    if (newEventData.endTime && e.target.value >= newEventData.endTime) {
                      const [hours, minutes] = e.target.value.split(':').map(Number);
                      const newEnd = `${(hours + 1).toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                      setNewEventData({ ...newEventData, startTime: e.target.value, endTime: newEnd });
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-ofa-ink"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-2">End Time</label>
                <input
                  type="time"
                  value={newEventData.endTime}
                  onChange={(e) => {
                    // Ensure end time is after start time
                    if (newEventData.startTime && e.target.value <= newEventData.startTime) {
                      alert('End time must be after start time');
                      return;
                    }
                    setNewEventData({ ...newEventData, endTime: e.target.value });
                  }}
                  min={newEventData.startTime || undefined}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-ofa-ink"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-2">Description (optional)</label>
                <textarea
                  value={newEventData.description}
                  onChange={(e) => setNewEventData({ ...newEventData, description: e.target.value })}
                  placeholder="Add details..."
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-ofa-ink resize-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">Timezone</label>
                <select
                  value={newEventData.timezone}
                  onChange={(e) => setNewEventData({ ...newEventData, timezone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-ofa-ink"
                >
                  <option value={Intl.DateTimeFormat().resolvedOptions().timeZone}>
                    {Intl.DateTimeFormat().resolvedOptions().timeZone}
                  </option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York</option>
                  <option value="America/Los_Angeles">America/Los_Angeles</option>
                  <option value="Europe/London">Europe/London</option>
                  <option value="Asia/Tokyo">Asia/Tokyo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">Reminder</label>
                <select
                  value={newEventData.reminder_minutes || ''}
                  onChange={(e) => setNewEventData({ ...newEventData, reminder_minutes: e.target.value ? parseInt(e.target.value) : null })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-ofa-ink"
                >
                  <option value="">None</option>
                  <option value="5">5 minutes before</option>
                  <option value="15">15 minutes before</option>
                  <option value="60">1 hour before</option>
                  <option value="1440">1 day before</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">Repeat</label>
                <select
                  value={newEventData.recurrence_freq}
                  onChange={(e) => setNewEventData({ ...newEventData, recurrence_freq: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-ofa-ink"
                >
                  <option value="none">None</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              {newEventData.recurrence_freq !== 'none' && (
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">End repeat</label>
                    <select
                      value={newEventData.recurrence_end_date ? 'date' : newEventData.recurrence_count ? 'count' : 'never'}
                      onChange={(e) => {
                        if (e.target.value === 'never') {
                          setNewEventData({ ...newEventData, recurrence_end_date: '', recurrence_count: '' });
                        } else if (e.target.value === 'date') {
                          setNewEventData({ ...newEventData, recurrence_end_date: format(quickAddSlot.date, 'yyyy-MM-dd'), recurrence_count: '' });
                        } else {
                          setNewEventData({ ...newEventData, recurrence_end_date: '', recurrence_count: '10' });
                        }
                      }}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-ofa-ink"
                    >
                      <option value="never">Never</option>
                      <option value="date">On date</option>
                      <option value="count">After N occurrences</option>
                    </select>
                  </div>
                  {newEventData.recurrence_end_date && (
                    <input
                      type="date"
                      value={newEventData.recurrence_end_date}
                      onChange={(e) => setNewEventData({ ...newEventData, recurrence_end_date: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-ofa-ink"
                    />
                  )}
                  {newEventData.recurrence_count && (
                    <input
                      type="number"
                      value={newEventData.recurrence_count}
                      onChange={(e) => setNewEventData({ ...newEventData, recurrence_count: e.target.value })}
                      placeholder="Number of occurrences"
                      min="1"
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-ofa-ink"
                    />
                  )}
                </div>
              )}
              
              <div className="text-sm text-gray-600">
                {format(quickAddSlot.date, 'EEEE, MMM d, yyyy')}
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleCreateEvent}
                  disabled={!newEventData.title.trim()}
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-black disabled:opacity-50 transition-colors"
                >
                  Add {newEventData.type}
                </button>
                <button
                  onClick={() => {
                    setQuickAddSlot(null);
                    setNewEventData({ 
                      title: '', 
                      type: 'event', 
                      description: '', 
                      color: typeColors.event, 
                      startTime: '', 
                      endTime: '',
                      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                      reminder_minutes: null,
                      recurrence_freq: 'none',
                      recurrence_end_date: '',
                      recurrence_count: ''
                    });
                    setCreatingRange(null);
                    setRangeStart(null);
                  }}
                  className="px-4 py-2 bg-white border border-gray-300 text-black rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && showEventDetail && !editingEvent && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={() => {
            setShowEventDetail(false);
            setSelectedEvent(null);
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl text-black">{selectedEvent.title}</h3>
              <button
                onClick={() => {
                  setShowEventDetail(false);
                  setSelectedEvent(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-3 mb-6">
              <div>
                <div className="text-xs text-gray-500 mb-1">Time</div>
                <div className="text-sm text-gray-900">
                  {format(new Date(selectedEvent.start_time), 'EEEE, MMM d, yyyy')} • {formatTime(selectedEvent.start_time)} - {formatTime(selectedEvent.end_time)}
                </div>
              </div>
              
              {selectedEvent.description && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">Description</div>
                  <div className="text-sm text-gray-900">{selectedEvent.description}</div>
                </div>
              )}
              
              {selectedEvent.timezone && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">Timezone</div>
                  <div className="text-sm text-gray-900">{selectedEvent.timezone}</div>
                </div>
              )}
              
              {selectedEvent.reminder_minutes && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">Reminder</div>
                  <div className="text-sm text-gray-900">
                    {selectedEvent.reminder_minutes < 60 
                      ? `${selectedEvent.reminder_minutes} minutes before`
                      : selectedEvent.reminder_minutes < 1440
                      ? `${Math.floor(selectedEvent.reminder_minutes / 60)} hour(s) before`
                      : `${Math.floor(selectedEvent.reminder_minutes / 1440)} day(s) before`}
                  </div>
                </div>
              )}
              
              {selectedEvent.recurrence_rule && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">Repeats</div>
                  <div className="text-sm text-gray-900">
                    {(() => {
                      try {
                        const rule = typeof selectedEvent.recurrence_rule === 'string' 
                          ? JSON.parse(selectedEvent.recurrence_rule) 
                          : selectedEvent.recurrence_rule;
                        return rule.freq ? `Every ${rule.freq}` : 'Repeating';
                      } catch {
                        return 'Repeating';
                      }
                    })()}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingEvent(selectedEvent);
                  setEditFormData({
                    title: selectedEvent.title,
                    description: selectedEvent.description || '',
                    type: selectedEvent.type,
                    color: selectedEvent.color || typeColors[selectedEvent.type],
                    timezone: selectedEvent.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
                    reminder_minutes: selectedEvent.reminder_minutes || null,
                    recurrence_rule: selectedEvent.recurrence_rule ? (typeof selectedEvent.recurrence_rule === 'string' ? JSON.parse(selectedEvent.recurrence_rule) : selectedEvent.recurrence_rule) : null
                  });
                }}
                className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => handleDuplicateEvent(selectedEvent)}
                className="px-4 py-2 bg-white border border-gray-300 text-black rounded-lg hover:bg-gray-100 transition-colors text-sm"
              >
                Duplicate
              </button>
              <button
                onClick={() => handleDeleteEvent(selectedEvent.id)}
                className="px-4 py-2 bg-white border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Details/Edit Panel */}
      {selectedEvent && editingEvent && (
        <>
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => {
              setSelectedEvent(null);
              setEditingEvent(null);
              setEditFormData({});
            }}
          ></div>
          <div className="fixed inset-y-0 right-0 w-96 bg-white border-l border-gray-300 shadow-2xl z-50 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl text-black">Edit Entry</h2>
                <button
                  onClick={() => {
                    setSelectedEvent(null);
                    setEditingEvent(null);
                    setEditFormData({});
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Type</label>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(typeColors).map(([type, color]) => (
                      <button
                        key={type}
                        onClick={() => setEditFormData({ ...editFormData, type, color })}
                        className={`px-3 py-2 rounded-lg text-sm capitalize transition-colors ${
                          editFormData.type === type
                            ? 'ring-2 ring-ofa-ink'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                        style={{
                          backgroundColor: editFormData.type === type ? color : undefined,
                          color: editFormData.type === type ? 'white' : undefined
                        }}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Title</label>
                  <input
                    type="text"
                    value={editFormData.title || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-ofa-ink"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Description</label>
                  <textarea
                    value={editFormData.description || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-ofa-ink resize-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Time</label>
                  <div className="text-sm text-black space-y-1">
                    <div>Start: {format(new Date(selectedEvent.start_time), 'MMM d, yyyy h:mm a')}</div>
                    <div>End: {format(new Date(selectedEvent.end_time), 'MMM d, yyyy h:mm a')}</div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">Timezone</label>
                  <select
                    value={editFormData.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone}
                    onChange={(e) => setEditFormData({ ...editFormData, timezone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-ofa-ink"
                  >
                    <option value={Intl.DateTimeFormat().resolvedOptions().timeZone}>
                      {Intl.DateTimeFormat().resolvedOptions().timeZone}
                    </option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New_York</option>
                    <option value="America/Los_Angeles">America/Los_Angeles</option>
                    <option value="Europe/London">Europe/London</option>
                    <option value="Asia/Tokyo">Asia/Tokyo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">Reminder</label>
                  <select
                    value={editFormData.reminder_minutes || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, reminder_minutes: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-ofa-ink"
                  >
                    <option value="">None</option>
                    <option value="5">5 minutes before</option>
                    <option value="15">15 minutes before</option>
                    <option value="60">1 hour before</option>
                    <option value="1440">1 day before</option>
                  </select>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleUpdateEvent}
                    disabled={!editFormData.title?.trim()}
                    className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-black disabled:opacity-50 transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(selectedEvent.id)}
                    className="px-4 py-2 bg-gray-100 text-black rounded-lg hover:text-black transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Legend */}
      <div className="mt-6 flex items-center gap-6 text-sm">
        {Object.entries(typeColors).map(([type, color]) => (
          <div key={type} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
            <span className="text-gray-500 capitalize">{type}s</span>
          </div>
        ))}
      </div>
    </div>
  );
}
