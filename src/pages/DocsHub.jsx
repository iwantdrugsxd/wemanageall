import { Link } from 'react-router-dom';
import Page from '../components/layout/Page';
import PageHeader from '../components/layout/PageHeader';
import Panel from '../components/layout/Panel';

/**
 * Docs Hub - Simple navigation hub for Phase 1
 * Links to Library, Lists, and Resources
 */
export default function DocsHub() {
  const hubs = [
    {
      title: 'Library',
      description: 'Access your documents and resources',
      to: '/docs?view=library',
      icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
    },
    {
      title: 'Lists',
      description: 'Manage your lists and collections',
      to: '/docs?view=lists',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
    },
    {
      title: 'Resources',
      description: 'Additional resources and files',
      to: '/docs?view=resources',
      icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z'
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
