import { useState } from 'react';
import { cn } from '../../lib/cn';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import IconButton from '../ui/IconButton';
// Icons are inline SVG paths

/**
 * Database Toolbar - Reusable OS-style controls for database views
 * Used across Projects, Docs, and other database collections
 */
export default function DatabaseToolbar({
  viewType = 'table',
  onViewChange,
  search = '',
  onSearchChange,
  filters = {},
  onFiltersChange,
  sort = {},
  onSortChange,
  group = null,
  onGroupChange,
  savedViews = null, // useSavedViews hook result
  onNew,
  className
}) {
  const [showFilters, setShowFilters] = useState(false);
  const [showSavedViews, setShowSavedViews] = useState(false);

  const activeView = savedViews?.getActiveView();

  return (
    <div className={cn('flex items-center gap-2 flex-wrap mb-4', className)}>
      {/* View Switcher */}
      <div className="flex items-center gap-1 border rounded-lg p-1" style={{ borderColor: 'var(--border-subtle)' }}>
        <button
          onClick={() => onViewChange('table')}
          className={cn(
            'px-3 py-1.5 text-sm font-medium rounded transition-colors',
            viewType === 'table'
              ? 'bg-[var(--bg-surface)] text-[var(--text-primary)]'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          )}
          aria-label="Table view"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
        <button
          onClick={() => onViewChange('grid')}
          className={cn(
            'px-3 py-1.5 text-sm font-medium rounded transition-colors',
            viewType === 'grid'
              ? 'bg-[var(--bg-surface)] text-[var(--text-primary)]'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          )}
          aria-label="Grid view"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        </button>
      </div>

      {/* Saved Views Dropdown */}
      {savedViews && (
        <div className="relative">
          <Select
            value={savedViews.activeViewId || ''}
            onChange={(e) => {
              const viewId = e.target.value;
              if (viewId) {
                savedViews.setActiveView(viewId);
                const view = savedViews.getActiveView();
                if (view) {
                  onViewChange(view.viewType);
                  onSearchChange(view.search || '');
                  if (view.filters) onFiltersChange(view.filters);
                  if (view.sort) onSortChange(view.sort);
                  if (view.group) onGroupChange(view.group);
                }
              } else {
                savedViews.setActiveView(null);
              }
            }}
            className="w-40 text-sm"
          >
            <option value="">All Views</option>
            {savedViews.getViews().map(view => (
              <option key={view.id} value={view.id}>{view.name}</option>
            ))}
          </Select>
        </div>
      )}

      {/* Search */}
      <div className="flex-1 min-w-[200px] max-w-md">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <Input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Filter Button */}
      <IconButton
        variant={Object.keys(filters).length > 0 ? 'primary' : 'ghost'}
        size="md"
        onClick={() => setShowFilters(!showFilters)}
        aria-label="Filters"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
      </IconButton>

      {/* Sort Dropdown */}
      <Select
        value={sort.field || ''}
        onChange={(e) => onSortChange({ field: e.target.value, direction: sort.direction || 'asc' })}
        className="w-32 text-sm"
      >
        <option value="">Sort by...</option>
        <option value="name">Name</option>
        <option value="updated_at">Updated</option>
        <option value="created_at">Created</option>
        <option value="progress">Progress</option>
      </Select>

      {/* Group Dropdown (optional) */}
      {group !== undefined && (
        <Select
          value={group || ''}
          onChange={(e) => onGroupChange(e.target.value || null)}
          className="w-32 text-sm"
        >
          <option value="">No grouping</option>
          <option value="status">Group by Status</option>
          <option value="tags">Group by Tags</option>
          <option value="date">Group by Date</option>
        </Select>
      )}

      {/* Columns Button (placeholder) */}
      <IconButton
        variant="ghost"
        size="md"
        onClick={() => {}}
        aria-label="Column settings"
        title="Column settings (coming soon)"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
        </svg>
      </IconButton>

      {/* Primary Action */}
      {onNew && (
        <Button onClick={onNew} size="sm" className="ml-auto">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New
        </Button>
      )}
    </div>
  );
}
