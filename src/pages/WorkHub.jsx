import { Link } from 'react-router-dom';
import Page from '../components/layout/Page';
import PageHeader from '../components/layout/PageHeader';
import Panel from '../components/layout/Panel';
import { cn } from '../lib/cn';

/**
 * Work Hub - Simple navigation hub for Phase 1
 * Links to Tasks, Calendar, and Notifications
 */
export default function WorkHub() {
  const hubs = [
    {
      title: 'Tasks',
      description: 'Manage your daily objectives and tasks',
      to: '/home',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01'
    },
    {
      title: 'Calendar',
      description: 'View and manage your schedule',
      to: '/work?view=calendar',
      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
    },
    {
      title: 'Notifications',
      description: 'View your insights and notifications',
      to: '/work?view=notifications',
      icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'
    }
  ];

  return (
    <Page>
      <PageHeader 
        title="Work" 
        subtitle="Your execution center for tasks, calendar, and notifications"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hubs.map((hub) => (
          <Link key={hub.to} to={hub.to}>
            <Panel className="h-full hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start gap-4">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'var(--bg-surface)' }}
                >
                  <svg 
                    className="w-6 h-6 transition-colors" 
                    style={{ color: 'var(--text-primary)' }}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={hub.icon} />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium mb-1 transition-colors" style={{ color: 'var(--text-primary)' }}>
                    {hub.title}
                  </h3>
                  <p className="text-sm transition-colors" style={{ color: 'var(--text-muted)' }}>
                    {hub.description}
                  </p>
                </div>
              </div>
            </Panel>
          </Link>
        ))}
      </div>
    </Page>
  );
}
