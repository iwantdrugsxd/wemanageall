/**
 * Projects Filters Component
 * Filter bar with favorites, tags, archived toggle, and search
 */
export default function ProjectsFilters({
  showFavoritesOnly,
  setShowFavoritesOnly,
  filterTag,
  setFilterTag,
  showArchived,
  setShowArchived,
  availableTags,
  searchQuery,
  setSearchQuery,
  onFilterChange
}) {
  return (
    <div 
      className="mb-6 p-4 rounded-lg border transition-colors"
      style={{ 
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-subtle)'
      }}
    >
      <div className="flex items-center gap-3 flex-wrap">
        {/* Favorites Toggle */}
        <button
          onClick={() => {
            setShowFavoritesOnly(!showFavoritesOnly);
            if (onFilterChange) onFilterChange();
          }}
          className={`px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-2 ${
            showFavoritesOnly ? '' : ''
          }`}
          style={showFavoritesOnly ? {
            backgroundColor: 'var(--accent)',
            color: 'var(--bg-base)'
          } : {
            backgroundColor: 'var(--bg-surface)',
            color: 'var(--text-muted)'
          }}
        >
          <svg className="w-4 h-4" fill={showFavoritesOnly ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          Favorites
        </button>

        {/* Tag Filter */}
        <select
          value={filterTag}
          onChange={(e) => {
            setFilterTag(e.target.value);
            if (onFilterChange) onFilterChange();
          }}
          className="px-3 py-1.5 rounded-lg text-sm transition-colors border"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-subtle)',
            color: 'var(--text-primary)'
          }}
        >
          <option value="">All Tags</option>
          {availableTags.map(tag => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>

        {/* Archived Toggle */}
        <button
          onClick={() => {
            setShowArchived(!showArchived);
            if (onFilterChange) onFilterChange();
          }}
          className={`px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-2 ${
            showArchived ? '' : ''
          }`}
          style={showArchived ? {
            backgroundColor: 'var(--accent)',
            color: 'var(--bg-base)'
          } : {
            backgroundColor: 'var(--bg-surface)',
            color: 'var(--text-muted)'
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
          {showArchived ? 'Active' : 'Archived'}
        </button>

        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
            className="w-full px-3 py-1.5 rounded-lg text-sm transition-colors border"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-primary)'
            }}
          />
        </div>
      </div>
    </div>
  );
}
