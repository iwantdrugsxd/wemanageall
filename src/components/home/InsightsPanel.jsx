import InsightsWidget from '../InsightsWidget';
import Panel from '../layout/Panel';

/**
 * Insights Panel Component
 * Wrapper for InsightsWidget with enterprise Panel styling
 */
export default function InsightsPanel() {
  return (
    <Panel title="Insights">
      <InsightsWidget />
    </Panel>
  );
}
