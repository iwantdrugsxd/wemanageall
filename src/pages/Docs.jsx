import { useSearchParams } from 'react-router-dom';
import Page from '../components/layout/Page';
import PageHeader from '../components/layout/PageHeader';
import Tabs, { TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import Library from './Library';
import Lists from './Lists';
import Button from '../components/ui/Button';
// Icons are inline SVG paths

/**
 * Docs Hub - Unified knowledge hub for Library, Lists, and Resources
 * Phase 5: Database-style interface with tabs (no left sidebar)
 */
export default function Docs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get('view') || 'library';

  const handleViewChange = (newView) => {
    setSearchParams({ view: newView });
  };

  return (
    <Page>
      <PageHeader
        title="Docs"
        subtitle="All knowledge, lists, and resources in one place"
        actions={
          <Button onClick={() => {
            if (view === 'library') {
              // Trigger Library's add modal if available
              window.dispatchEvent(new CustomEvent('library:open-add-modal'));
            } else if (view === 'lists') {
              // Trigger Lists' create modal if available
              window.dispatchEvent(new CustomEvent('lists:open-create-modal'));
            }
          }}>
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New
          </Button>
        }
      />

      {/* Collection Tabs */}
      <Tabs value={view} onValueChange={handleViewChange} className="mb-6">
        <TabsList>
          <TabsTrigger value="library" activeValue={view} onValueChange={handleViewChange}>
            📚 Library
          </TabsTrigger>
          <TabsTrigger value="lists" activeValue={view} onValueChange={handleViewChange}>
            📋 Lists
          </TabsTrigger>
          <TabsTrigger value="resources" activeValue={view} onValueChange={handleViewChange}>
            📁 Resources
          </TabsTrigger>
        </TabsList>

        <TabsContent value="library" activeValue={view}>
          <Library embedded />
        </TabsContent>

        <TabsContent value="lists" activeValue={view}>
          <Lists embedded />
        </TabsContent>

        <TabsContent value="resources" activeValue={view}>
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📁</div>
            <h2 className="text-2xl font-light mb-2 transition-colors" style={{ color: 'var(--text-primary)' }}>
              Resources
            </h2>
            <p className="text-sm transition-colors" style={{ color: 'var(--text-muted)' }}>
              Coming soon
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </Page>
  );
}
