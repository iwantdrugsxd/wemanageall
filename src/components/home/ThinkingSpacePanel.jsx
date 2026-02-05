/**
 * Thinking Space Panel Component
 * Displays and manages thinking space entries
 */
export default function ThinkingSpacePanel({
  showThinkingSpace,
  setShowThinkingSpace,
  thoughtMode,
  setThoughtMode,
  thoughtContent,
  setThoughtContent,
  wordCount,
  lastSaved,
  saved,
  thoughtError,
  saving,
  todayThoughts,
  editingThoughtId,
  editingThoughtContent,
  setEditingThoughtContent,
  editingThoughtMode,
  setEditingThoughtMode,
  thoughtModes,
  onSaveThought,
  onUpdateThought,
  onEditThought,
  onDeleteThought,
  onCancelEditThought
}) {
  return (
    <div 
      className="rounded-lg border overflow-hidden transition-colors"
      style={{ 
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-subtle)'
      }}
    >
      <div className="p-6 border-b transition-colors" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium uppercase tracking-wide transition-colors" style={{ color: 'var(--text-primary)' }}>
            Thinking Space
          </h2>
          <button
            onClick={() => setShowThinkingSpace(!showThinkingSpace)}
            className="text-xs transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            {showThinkingSpace ? 'COLLAPSE' : 'EXPAND'}
          </button>
        </div>
      </div>

      {showThinkingSpace ? (
        <div className="p-6">
          {todayThoughts.length > 0 && (
            <div className="mb-5 pb-5 border-b transition-colors" style={{ borderColor: 'var(--border-subtle)' }}>
              <h4 className="text-xs font-medium mb-2 transition-colors" style={{ color: 'var(--text-muted)' }}>
                Today's Saved Entries ({todayThoughts.length})
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {todayThoughts.map((thought) => (
                  <div key={thought.id} className="p-2.5 rounded border transition-colors" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium transition-colors" style={{ color: 'var(--text-muted)' }}>
                        {thought.mode === 'freewrite' ? 'Free write' : thought.mode === 'stuck' ? "I'm stuck" : 'Decision draft'}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs transition-colors" style={{ color: 'var(--text-muted)' }}>
                          {new Date(thought.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </span>
                        <button
                          onClick={() => onEditThought(thought)}
                          className="p-0.5 transition-colors"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => onDeleteThought(thought.id)}
                          className="p-0.5 transition-colors"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <p className="text-xs line-clamp-2 transition-colors" style={{ color: 'var(--text-primary)' }}>{thought.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {editingThoughtId && (
            <div className="mb-5 pb-5 border-b transition-colors" style={{ borderColor: 'var(--border-subtle)' }}>
              <h4 className="text-xs font-medium mb-2 transition-colors" style={{ color: 'var(--text-muted)' }}>Editing Entry</h4>
              <div className="mb-3 flex gap-2 flex-wrap">
                {thoughtModes.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setEditingThoughtMode(m.id)}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      editingThoughtMode === m.id
                        ? 'text-white'
                        : 'border transition-colors'
                    }`}
                    style={editingThoughtMode === m.id ? { backgroundColor: 'var(--accent)' } : { backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              <textarea 
                value={editingThoughtContent}
                onChange={(e) => setEditingThoughtContent(e.target.value)}
                placeholder="Edit your thought..."
                className="w-full h-40 p-3 rounded focus:outline-none text-sm leading-relaxed resize-none mb-3 transition-colors"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-primary)'
                }}
              />
              <div className="flex gap-2">
                <button
                  onClick={onUpdateThought}
                  disabled={!editingThoughtContent.trim() || saving}
                  className="px-4 py-1.5 rounded text-xs transition-colors disabled:opacity-50"
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: 'var(--bg-base)'
                  }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={onCancelEditThought}
                  className="px-4 py-1.5 rounded text-xs transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    color: 'var(--text-muted)'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          
          {!editingThoughtId && (
            <>
              <div className="mb-4 flex gap-2 flex-wrap">
                {thoughtModes.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setThoughtMode(m.id)}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      thoughtMode === m.id
                        ? 'text-white'
                        : 'border transition-colors'
                    }`}
                    style={thoughtMode === m.id ? { backgroundColor: 'var(--accent)' } : { backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              
              <textarea 
                value={thoughtContent}
                onChange={(e) => setThoughtContent(e.target.value)}
                placeholder="Start typing your stream of consciousness here..."
                className="w-full h-48 p-3 rounded focus:outline-none text-sm leading-relaxed resize-none mb-3 transition-colors"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-primary)'
                }}
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs transition-colors" style={{ color: 'var(--text-muted)' }}>
                  <span>{wordCount} words</span>
                  {lastSaved && (
                    <span>Saved {Math.floor((Date.now() - lastSaved) / 60000)}m ago</span>
                  )}
                </div>
                <button
                  onClick={onSaveThought}
                  disabled={!thoughtContent.trim() || saving}
                  className="px-4 py-1.5 rounded text-xs transition-colors disabled:opacity-50 flex items-center gap-1.5"
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: 'var(--bg-base)'
                  }}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Save</span>
                </button>
              </div>
            </>
          )}
          
          {saved && (
            <div className="mt-3 p-2 text-xs text-center transition-colors" style={{ color: 'var(--text-muted)' }}>
              Saved successfully
            </div>
          )}
          {thoughtError && (
            <div className="mt-3 p-2 text-xs text-center transition-colors" style={{ color: 'var(--error)' }}>
              {thoughtError}
            </div>
          )}
        </div>
      ) : (
        <div className="p-6">
          {todayThoughts.length > 0 ? (
            <div className="space-y-2 mb-3">
              <p className="text-xs mb-3 transition-colors" style={{ color: 'var(--text-muted)' }}>Today's entries:</p>
              {todayThoughts.slice(0, 3).map((thought) => (
                <div key={thought.id} className="p-2.5 rounded border transition-colors" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium transition-colors" style={{ color: 'var(--text-muted)' }}>
                      {thought.mode === 'freewrite' ? 'Free write' : thought.mode === 'stuck' ? "I'm stuck" : 'Decision draft'}
                    </span>
                    <span className="text-xs transition-colors" style={{ color: 'var(--text-muted)' }}>
                      {new Date(thought.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs line-clamp-2 transition-colors" style={{ color: 'var(--text-primary)' }}>{thought.content}</p>
                </div>
              ))}
              {todayThoughts.length > 3 && (
                <p className="text-xs text-center transition-colors" style={{ color: 'var(--text-muted)' }}>+{todayThoughts.length - 3} more entries</p>
              )}
            </div>
          ) : (
            <div className="text-center mb-3">
              <p className="text-xs italic mb-3 transition-colors" style={{ color: 'var(--text-muted)' }}>Need to process your thoughts? Capture the whispers of your mind here.</p>
            </div>
          )}
          <button
            onClick={() => setShowThinkingSpace(true)}
            className="w-full px-4 py-2 rounded text-xs transition-colors"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--bg-base)'
            }}
          >
            {todayThoughts.length > 0 ? 'CONTINUE WRITING' : 'START WRITING'}
          </button>
        </div>
      )}
    </div>
  );
}
