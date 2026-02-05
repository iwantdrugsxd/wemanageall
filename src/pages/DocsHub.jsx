import { Link } from 'react-router-dom';
import Page from '../components/layout/Page';
import PageHeader from '../components/layout/PageHeader';
import Panel from '../components/layout/Panel';

/**
 * Docs Hub - Simple navigation hub for Phase 1
 * Links to Resources and Lists
 */
export default function DocsHub() {
  const hubs = [
    {
      title: 'Resources',
      description: 'Access your documents and resources',
      to: '/docs?view=resources',
      icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z'
    },
    {
      title: 'Lists',
      description: 'Manage your lists and collections',
      to: '/docs?view=lists',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
    }
  ];

  return (
    <Page>
      <PageHeader 
        title="Docs" 
        subtitle="Your knowledge hub for documents, lists, and resources"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hubs.map((hub) => (
          <Link key={hub.to} to={hub.to}>
            <Panel className="h-full hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start gap-4">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'var(--bg-surface)' }}
                >
                  <svg 
                    className="w-6 h-6 transition-colors" 
                    style={{ color: 'var(--text-primary)' }}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={hub.icon} />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium mb-1 transition-colors" style={{ color: 'var(--text-primary)' }}>
                    {hub.title}
                  </h3>
                  <p className="text-sm transition-colors" style={{ color: 'var(--text-muted)' }}>
                    {hub.description}
                  </p>
                </div>
              </div>
            </Panel>
          </Link>
        ))}
      </div>
    </Page>
  );
}
