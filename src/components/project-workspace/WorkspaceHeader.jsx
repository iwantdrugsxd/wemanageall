import { Link } from 'react-router-dom';
import PageHeader from '../layout/PageHeader';
import Button from '../ui/Button';
import IconButton from '../ui/IconButton';
import Badge from '../ui/Badge';

/**
 * Workspace Header Component
 * Project header with breadcrumb and actions
 */
export default function WorkspaceHeader({
  project,
  userRole,
  collaboratorsCount,
  onShare,
  onToggleCollaborators,
  onAddTask,
  onFilter
}) {
  return (
    <PageHeader
      title={
        <div className="flex items-center gap-2">
          <Link
            to="/projects"
            className="text-sm font-normal text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            Projects
          </Link>
          <span className="text-sm text-[var(--text-muted)]">/</span>
          <span>{project?.name || 'Project'}</span>
        </div>
      }
      subtitle={project?.description}
      actions={
        <div className="flex items-center gap-2">
          {onFilter && (
            <IconButton
              variant="ghost"
              size="sm"
              onClick={onFilter}
              aria-label="Filter"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </IconButton>
          )}
          {onToggleCollaborators && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onToggleCollaborators}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {collaboratorsCount !== undefined && (
                <Badge variant="neutral" className="ml-1">
                  {collaboratorsCount}
                </Badge>
              )}
            </Button>
          )}
          {onAddTask && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onAddTask}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Task
            </Button>
          )}
          {(userRole === 'owner' || userRole === 'admin') && onShare && (
            <Button
              variant="primary"
              size="sm"
              onClick={onShare}
            >
              Share
            </Button>
          )}
        </div>
      }
    />
  );
}
