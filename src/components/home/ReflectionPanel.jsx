/**
 * Reflection Panel Component
 * Displays and manages daily reflection
 */
export default function ReflectionPanel({
  reflection,
  setReflection,
  reflectionMood,
  setReflectionMood,
  reflectionSaved,
  reflectionLastSaved,
  reflectionError,
  savingReflection,
  onSaveReflection,
  onDeleteReflection
}) {
  return (
    <div 
      className="rounded-lg p-6 border transition-colors"
      style={{ 
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-subtle)'
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium uppercase tracking-wide transition-colors" style={{ color: 'var(--text-primary)' }}>
          Reflection
        </h2>
        {reflectionSaved && (
          <div className="flex items-center gap-2 text-xs transition-colors" style={{ color: 'var(--text-muted)' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {reflectionLastSaved && (
              <span>Saved {new Date(reflectionLastSaved).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
            )}
          </div>
        )}
      </div>
      
      <div className="space-y-3">
        <div>
          <label className="block text-xs mb-2 transition-colors" style={{ color: 'var(--text-muted)' }}>Mood (optional)</label>
          <select
            value={reflectionMood || ''}
            onChange={(e) => setReflectionMood(e.target.value || null)}
            className="w-full px-3 py-2 border rounded text-sm transition-colors focus:outline-none"
            style={{
              borderColor: 'var(--border-subtle)',
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-primary)'
            }}
          >
            <option value="">Select mood</option>
            <option value="excited">😊 Excited</option>
            <option value="grateful">🙏 Grateful</option>
            <option value="calm">😌 Calm</option>
            <option value="focused">🎯 Focused</option>
            <option value="tired">😴 Tired</option>
            <option value="anxious">😰 Anxious</option>
            <option value="frustrated">😤 Frustrated</option>
            <option value="content">😊 Content</option>
          </select>
        </div>
        
        <textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="How did today go? What did you learn? What would you do differently?"
          className="w-full h-32 px-3 py-2 border rounded text-sm transition-colors focus:outline-none resize-none"
          style={{
            borderColor: 'var(--border-subtle)',
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text-primary)'
          }}
        />
        
        {reflectionError && (
          <div className="text-xs transition-colors" style={{ color: 'var(--error)' }}>
            {reflectionError}
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <button
            onClick={onSaveReflection}
            disabled={savingReflection}
            className="px-4 py-1.5 text-xs rounded transition-colors disabled:opacity-50"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--bg-base)'
            }}
          >
            {savingReflection ? 'Saving...' : 'Save Reflection'}
          </button>
          {reflection && (
            <button
              onClick={onDeleteReflection}
              className="px-4 py-1.5 text-xs transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
