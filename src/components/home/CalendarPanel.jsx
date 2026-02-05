import { Link } from 'react-router-dom';

/**
 * Calendar Panel Component
 * Displays today's schedule and upcoming events
 */
export default function CalendarPanel({
  calendarEvents,
  showAddEvent,
  setShowAddEvent,
  newEvent,
  setNewEvent,
  eventError,
  savingEvent,
  eventsByDay,
  sortedDayKeys,
  formatDayLabel,
  formatEventTime,
  onCreateEvent,
  onDeleteEvent,
  onCancelAddEvent
}) {
  const now = new Date();

  return (
    <div 
      className="rounded-lg p-6 border transition-colors"
      style={{ 
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-subtle)'
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium uppercase tracking-wide transition-colors" style={{ color: 'var(--text-primary)' }}>
          Schedule
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddEvent(true)}
            className="transition-colors"
            style={{ color: 'var(--text-muted)' }}
            title="Add Event"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <Link to="/work?view=calendar" className="transition-colors" style={{ color: 'var(--text-muted)' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </Link>
        </div>
      </div>
      
      {showAddEvent && (
        <div className="mb-4 p-3 rounded border space-y-2 transition-colors" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
          <input
            type="text"
            value={newEvent.title}
            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
            placeholder="Event title"
            className="w-full px-3 py-2 border-b transition-colors focus:outline-none text-sm"
            style={{
              borderColor: 'var(--border-mid)',
              color: 'var(--text-primary)'
            }}
            autoFocus
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="time"
              value={newEvent.startTime}
              onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
              className="w-full px-3 py-2 border-b transition-colors focus:outline-none text-sm"
              style={{
                borderColor: 'var(--border-mid)',
                color: 'var(--text-primary)'
              }}
            />
            <input
              type="time"
              value={newEvent.endTime}
              onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
              min={newEvent.startTime || undefined}
              className="w-full px-3 py-2 border-b transition-colors focus:outline-none text-sm"
              style={{
                borderColor: 'var(--border-mid)',
                color: 'var(--text-primary)'
              }}
            />
          </div>
          {eventError && (
            <p className="text-xs transition-colors" style={{ color: 'var(--error)' }}>{eventError}</p>
          )}
          <div className="flex gap-2">
            <button
              onClick={onCreateEvent}
              disabled={savingEvent || !newEvent.title.trim() || !newEvent.startTime || !newEvent.endTime}
              className="px-3 py-1.5 text-xs rounded transition-colors disabled:opacity-50"
              style={{
                backgroundColor: 'var(--accent)',
                color: 'var(--bg-base)'
              }}
            >
              {savingEvent ? 'Adding...' : 'Add'}
            </button>
            <button
              onClick={onCancelAddEvent}
              className="px-3 py-1.5 text-xs transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      <div className="space-y-4 max-h-[400px] overflow-y-auto">
        {sortedDayKeys.length > 0 ? (
          sortedDayKeys.map((dayKey) => {
            const dayData = eventsByDay[dayKey];
            const dayEvents = dayData.events;
            const isToday = formatDayLabel(dayData.date) === 'TODAY';
            
            return (
              <div key={dayKey} className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className={`text-xs uppercase tracking-wider font-medium transition-colors ${isToday ? '' : ''}`} style={{ color: isToday ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {formatDayLabel(dayData.date)}
                  </h3>
                  {isToday && (
                    <div className="flex-1 h-px transition-colors" style={{ backgroundColor: 'var(--border-subtle)' }}></div>
                  )}
                </div>
                
                <div className="space-y-2.5 pl-2">
                  {dayEvents.map((event) => {
                    const eventStart = new Date(event.start_time);
                    const eventEnd = new Date(event.end_time);
                    const isActive = eventStart <= now && eventEnd >= now;
                    const isUpcoming = eventStart > now;
                    
                    return (
                      <div key={event.id} className="group flex items-start gap-3 -mx-2 px-2 py-1 rounded transition-colors" style={{ backgroundColor: 'transparent' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-surface)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          isActive ? 'bg-green-500' : isUpcoming ? 'bg-gray-400' : 'bg-gray-300'
                        }`}></div>
                        <div className="flex-1 min-w-0">
                          {isActive && (
                            <div className="text-xs font-medium mb-0.5 transition-colors" style={{ color: '#10b981' }}>ACTIVE NOW</div>
                          )}
                          <div className={`text-sm transition-colors ${isActive ? 'font-medium' : ''}`} style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-primary)' }}>
                            {event.title}
                          </div>
                          <div className="text-xs transition-colors mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            {formatEventTime(event.start_time, event.end_time)}
                          </div>
                        </div>
                        <button
                          onClick={() => onDeleteEvent(event.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 transition-colors"
                          style={{ color: 'var(--text-muted)' }}
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
            <p className="text-xs text-center py-4 transition-colors" style={{ color: 'var(--text-muted)' }}>No events scheduled</p>
          )
        )}
      </div>
      
      <Link 
        to="/work?view=calendar" 
        className="block mt-4 text-center text-xs transition-colors"
        style={{ color: 'var(--text-muted)' }}
      >
        + VIEW FULL CALENDAR
      </Link>
    </div>
  );
}
