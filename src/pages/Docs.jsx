import { useSearchParams } from 'react-router-dom';
import Page from '../components/layout/Page';
import PageHeader from '../components/layout/PageHeader';
import Tabs, { TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import Library from './Library';
import Lists from './Lists';
import Button from '../components/ui/Button';
// Icons are inline SVG paths

/**
 * Docs Hub - Unified knowledge hub for Resources, Lists
 * Phase 5: Database-style interface with tabs (no left sidebar)
 */
export default function Docs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get('view') || 'resources';

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
            if (view === 'resources') {
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
          <TabsTrigger value="resources" activeValue={view} onValueChange={handleViewChange}>
            📁 Resources
          </TabsTrigger>
          <TabsTrigger value="lists" activeValue={view} onValueChange={handleViewChange}>
            📋 Lists
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resources" activeValue={view}>
          <Library embedded />
        </TabsContent>

        <TabsContent value="lists" activeValue={view}>
          <Lists embedded />
        </TabsContent>
      </Tabs>
    </Page>
  );
}
