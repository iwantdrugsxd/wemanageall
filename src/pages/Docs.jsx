import { useSearchParams } from 'react-router-dom';
import Library from './Library';
import Lists from './Lists';

/**
 * Docs Hub - Unified knowledge hub for Library, Lists, and Resources
 * Phase 5: Enterprise interface with left sidebar navigation
 */
export default function Docs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get('view') || 'library';

  const handleViewChange = (newView) => {
    setSearchParams({ view: newView });
  };

  const sections = [
    { id: 'library', label: 'Library', icon: '📚' },
    { id: 'lists', label: 'Lists', icon: '📋' },
    { id: 'resources', label: 'Resources', icon: '📁' }
  ];

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--bg-base)' }}>
      {/* Left Sidebar */}
      <div 
        className="w-64 flex-shrink-0 border-r"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-subtle)'
        }}
      >
        {/* Header */}
        <div className="p-6 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <h1 className="text-2xl font-light transition-colors mb-1" style={{ color: 'var(--text-primary)' }}>
            Docs
          </h1>
          <p className="text-xs transition-colors" style={{ color: 'var(--text-muted)' }}>
            All knowledge, lists, and resources in one place
          </p>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => handleViewChange(section.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                view === section.id ? '' : ''
              }`}
              style={view === section.id ? {
                backgroundColor: 'var(--accent)',
                color: 'var(--bg-base)'
              } : {
                backgroundColor: 'transparent',
                color: 'var(--text-muted)'
              }}
              onMouseEnter={(e) => {
                if (view !== section.id) {
                  e.target.style.backgroundColor = 'var(--bg-surface)';
                  e.target.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (view !== section.id) {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = 'var(--text-muted)';
                }
              }}
            >
              <span className="text-lg">{section.icon}</span>
              <span className="font-medium">{section.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {view === 'library' && <Library />}
        {view === 'lists' && <Lists />}
        {view === 'resources' && (
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📁</div>
              <h2 className="text-2xl font-light mb-2 transition-colors" style={{ color: 'var(--text-primary)' }}>
                Resources
              </h2>
              <p className="text-sm transition-colors" style={{ color: 'var(--text-muted)' }}>
                Coming soon
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
