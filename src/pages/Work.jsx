import { useSearchParams } from 'react-router-dom';
import Calendar from './Calendar';
import Notifications from './Notifications';

/**
 * Work Hub - Central place for work-related features
 * Phase 1: Placeholder that renders appropriate views based on query params
 * Future: Will host Tasks, Calendar, Notifications in unified interface
 */
export default function Work() {
  const [searchParams] = useSearchParams();
  const view = searchParams.get('view');

  // Render specific views if provided (they're already wrapped in Layout by App.jsx)
  if (view === 'calendar') {
    return <Calendar />;
  }

  if (view === 'notifications') {
    return <Notifications />;
  }

  // Default: Show placeholder hub page
  return (
    <div className="min-h-screen p-6 lg:p-8" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-light transition-colors" style={{ color: 'var(--text-primary)' }}>
            Work Hub
          </h1>
          <p className="text-lg transition-colors mt-2" style={{ color: 'var(--text-muted)' }}>
            Your central workspace for tasks, calendar, and notifications
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Calendar Card */}
          <div 
            className="p-6 rounded-xl border transition-colors cursor-pointer"
            style={{ 
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-subtle)'
            }}
            onClick={() => window.location.href = '/work?view=calendar'}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-mid)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
            }}
          >
            <div className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center" style={{ backgroundColor: 'var(--bg-surface)' }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-primary)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2 transition-colors" style={{ color: 'var(--text-primary)' }}>
              Calendar
            </h3>
            <p className="text-sm transition-colors" style={{ color: 'var(--text-muted)' }}>
              View and manage your schedule
            </p>
          </div>

          {/* Tasks Card (Placeholder) */}
          <div 
            className="p-6 rounded-xl border transition-colors"
            style={{ 
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-subtle)'
            }}
          >
            <div className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center" style={{ backgroundColor: 'var(--bg-surface)' }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-primary)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2 transition-colors" style={{ color: 'var(--text-primary)' }}>
              Tasks
            </h3>
            <p className="text-sm transition-colors" style={{ color: 'var(--text-muted)' }}>
              Coming soon
            </p>
          </div>

          {/* Notifications Card */}
          <div 
            className="p-6 rounded-xl border transition-colors cursor-pointer"
            style={{ 
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-subtle)'
            }}
            onClick={() => window.location.href = '/work?view=notifications'}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-mid)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
            }}
          >
            <div className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center" style={{ backgroundColor: 'var(--bg-surface)' }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-primary)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2 transition-colors" style={{ color: 'var(--text-primary)' }}>
              Notifications
            </h3>
            <p className="text-sm transition-colors" style={{ color: 'var(--text-muted)' }}>
              View your notifications
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
