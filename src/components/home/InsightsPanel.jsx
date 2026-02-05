import InsightsWidget from '../InsightsWidget';

/**
 * Insights Panel Component
 * Wrapper for InsightsWidget in the right column
 */
export default function InsightsPanel() {
  return (
    <div 
      className="rounded-lg p-6 border transition-colors"
      style={{ 
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-subtle)'
      }}
    >
      <h2 className="text-sm font-medium uppercase tracking-wide mb-4 transition-colors" style={{ color: 'var(--text-primary)' }}>
        Insights
      </h2>
      <InsightsWidget />
    </div>
  );
}
