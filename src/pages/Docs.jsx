import { useSearchParams } from 'react-router-dom';
import Library from './Library';
import Lists from './Lists';

/**
 * Docs Hub - Central place for documentation and knowledge features
 * Phase 1: Placeholder that redirects to appropriate views based on query params
 * Future: Will host Library, Lists, Resources in unified interface
 */
export default function Docs() {
  const [searchParams] = useSearchParams();
  const view = searchParams.get('view');

  // Redirect to specific views if provided
  if (view === 'library') {
    return <Library />;
  }

  if (view === 'lists') {
    return <Lists />;
  }

  // Default: Show placeholder hub page
  return (
    <div className="min-h-screen p-6 lg:p-8" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-light transition-colors" style={{ color: 'var(--text-primary)' }}>
            Docs Hub
          </h1>
          <p className="text-lg transition-colors mt-2" style={{ color: 'var(--text-muted)' }}>
            Your knowledge base for documents, lists, and resources
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Library Card */}
          <div 
            className="p-6 rounded-xl border transition-colors cursor-pointer"
            style={{ 
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-subtle)'
            }}
            onClick={() => window.location.href = '/docs?view=library'}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-mid)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
            }}
          >
            <div className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center" style={{ backgroundColor: 'var(--bg-surface)' }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-primary)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2 transition-colors" style={{ color: 'var(--text-primary)' }}>
              Library
            </h3>
            <p className="text-sm transition-colors" style={{ color: 'var(--text-muted)' }}>
              Access your documents and resources
            </p>
          </div>

          {/* Lists Card */}
          <div 
            className="p-6 rounded-xl border transition-colors cursor-pointer"
            style={{ 
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-subtle)'
            }}
            onClick={() => window.location.href = '/docs?view=lists'}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-mid)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
            }}
          >
            <div className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center" style={{ backgroundColor: 'var(--bg-surface)' }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-primary)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2 transition-colors" style={{ color: 'var(--text-primary)' }}>
              Lists
            </h3>
            <p className="text-sm transition-colors" style={{ color: 'var(--text-muted)' }}>
              Manage your lists and collections
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
