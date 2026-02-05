/**
 * Workspace Sidebar Component
 * Left navigation for project workspace sections
 */
export default function WorkspaceSidebar({
  activeSection,
  onSectionChange
}) {
  const sections = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'tasks', label: 'Tasks', icon: '✓' },
    { id: 'notes', label: 'Notes', icon: '📝' },
    { id: 'activity', label: 'Activity', icon: '🕐' },
    { id: 'files', label: 'Files', icon: '📁' }
  ];

  return (
    <div 
      className="w-64 flex-shrink-0 border-r"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-subtle)'
      }}
    >
      <nav className="p-4 space-y-1">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              activeSection === section.id ? '' : ''
            }`}
            style={activeSection === section.id ? {
              backgroundColor: 'var(--accent)',
              color: 'var(--bg-base)'
            } : {
              backgroundColor: 'transparent',
              color: 'var(--text-muted)'
            }}
            onMouseEnter={(e) => {
              if (activeSection !== section.id) {
                e.target.style.backgroundColor = 'var(--bg-surface)';
                e.target.style.color = 'var(--text-primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeSection !== section.id) {
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
  );
}
