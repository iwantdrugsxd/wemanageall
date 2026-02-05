import TasksPanel from './TasksPanel';

/**
 * Objectives Panel Component
 * Alias for TasksPanel (for Phase 2 enterprise naming)
 * Overdue badge logic can be added to TasksPanel in future
 */
export default function ObjectivesPanel(props) {
  return <TasksPanel {...props} />;
}
