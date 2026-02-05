import PageHeader from '../layout/PageHeader';
import Button from '../ui/Button';

/**
 * Projects Header Component
 * Enterprise header with title, summary, and action buttons
 */
export default function ProjectsHeader({
  projects,
  showFavoritesOnly,
  showArchived,
  onNewProject,
  onJoinProject
}) {
  const activeProjects = projects.filter(p => !p.archived);
  const favoriteCount = projects.filter(p => p.is_favorite && !p.archived).length;
  const archivedCount = projects.filter(p => p.archived).length;

  const getSummary = () => {
    if (showArchived) {
      return `${archivedCount} archived project${archivedCount !== 1 ? 's' : ''}`;
    }
    if (showFavoritesOnly) {
      return `${favoriteCount} favorite${favoriteCount !== 1 ? 's' : ''}`;
    }
    return `${activeProjects.length} active project${activeProjects.length !== 1 ? 's' : ''}`;
  };

  return (
    <PageHeader
      title="Projects"
      subtitle={getSummary()}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onJoinProject}
          >
            Join Project
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onNewProject}
          >
            New Project
          </Button>
        </div>
      }
    />
  );
}
