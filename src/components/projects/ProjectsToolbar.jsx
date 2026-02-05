import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import IconButton from '../ui/IconButton';
import { cn } from '../../lib/cn';

/**
 * Projects Toolbar Component
 * Search, filters, and view toggle
 */
export default function ProjectsToolbar({
  searchQuery,
  setSearchQuery,
  showFavoritesOnly,
  setShowFavoritesOnly,
  showArchived,
  setShowArchived,
  filterTag,
  setFilterTag,
  availableTags,
  viewMode,
  setViewMode,
  onFilterChange
}) {
  return (
    <div className="mb-6 flex items-center gap-3 flex-wrap">
      {/* Search */}
      <div className="flex-1 min-w-[200px]">
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search projects..."
          className="w-full"
        />
      </div>

      {/* Favorites Toggle */}
      <IconButton
        onClick={() => {
          setShowFavoritesOnly(!showFavoritesOnly);
          if (onFilterChange) onFilterChange();
        }}
        variant={showFavoritesOnly ? 'primary' : 'ghost'}
        aria-label="Show favorites only"
      >
        <svg className="w-4 h-4" fill={showFavoritesOnly ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      </IconButton>

      {/* Archived Toggle */}
      <Button
        variant={showArchived ? 'primary' : 'secondary'}
        size="sm"
        onClick={() => {
          setShowArchived(!showArchived);
          if (onFilterChange) onFilterChange();
        }}
      >
        {showArchived ? 'Active' : 'Archived'}
      </Button>

      {/* Tag Filter */}
      <Select
        value={filterTag}
        onChange={(e) => {
          setFilterTag(e.target.value);
          if (onFilterChange) onFilterChange();
        }}
        className="min-w-[120px]"
      >
        <option value="">All Tags</option>
        {availableTags.map(tag => (
          <option key={tag} value={tag}>{tag}</option>
        ))}
      </Select>

      {/* View Toggle */}
      <div className="flex items-center gap-1 border rounded-lg p-1" style={{ borderColor: 'var(--border-subtle)' }}>
        <button
          onClick={() => setViewMode('table')}
          className={cn(
            'px-3 py-1.5 rounded text-sm transition-colors',
            viewMode === 'table' 
              ? 'bg-[var(--accent)] text-[var(--bg-base)]' 
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          )}
        >
          Table
        </button>
        <button
          onClick={() => setViewMode('grid')}
          className={cn(
            'px-3 py-1.5 rounded text-sm transition-colors',
            viewMode === 'grid' 
              ? 'bg-[var(--accent)] text-[var(--bg-base)]' 
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          )}
        >
          Grid
        </button>
      </div>
    </div>
  );
}
