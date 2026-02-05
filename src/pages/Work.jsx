import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Page from '../components/layout/Page';
import PageHeader from '../components/layout/PageHeader';
import WorkTabs from '../components/work/WorkTabs';
import TasksView from '../components/work/views/TasksView';
import CalendarView from '../components/work/views/CalendarView';
import NotificationsView from '../components/work/views/NotificationsView';
import Button from '../components/ui/Button';
import UpgradeGate from '../components/UpgradeGate';

/**
 * Work Hub - Central execution center for tasks, calendar, and notifications
 * Phase 4: Unified interface with tabs
 */
export default function Work() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get('view') || 'tasks';

  // Validate view
  useEffect(() => {
    const validViews = ['tasks', 'calendar', 'notifications'];
    if (!validViews.includes(view)) {
      setSearchParams({ view: 'tasks' }, { replace: true });
    }
  }, [view, setSearchParams]);

  const handleTabChange = (newView) => {
    setSearchParams({ view: newView });
  };

  // Signal to open task composer from header button
  const [openComposerSignal, setOpenComposerSignal] = useState(0);

  const handleNewTask = () => {
    // Switch to tasks tab if not already
    if (view !== 'tasks') {
      setSearchParams({ view: 'tasks' });
    }
    // Trigger composer open
    setOpenComposerSignal(prev => prev + 1);
  };

  return (
    <Page>
      {/* Header */}
      <PageHeader
        title="Work"
        subtitle="Execution hub for tasks, schedules, and alerts"
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={handleNewTask}
          >
            New Task
          </Button>
        }
      />

      {/* Upgrade Gate */}
      <UpgradeGate message="Upgrade for unlimited tasks, advanced calendar features, and priority support" />

      {/* Tabs */}
      <WorkTabs value={view} onChange={handleTabChange} />

      {/* View Content */}
      {view === 'tasks' && <TasksView openComposerSignal={openComposerSignal} />}
      {view === 'calendar' && <CalendarView />}
      {view === 'notifications' && <NotificationsView />}
    </Page>
  );
}
