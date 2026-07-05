import { useState } from 'react';

/**
 * Intentions Panel Component
 * Displays and manages today's intentions
 */
export default function IntentionsPanel({
  intentions,
  newIntention,
  setNewIntention,
  showAddIntention,
  setShowAddIntention,
  editingIntentionId,
  setEditingIntentionId,
  editingIntentionText,
  setEditingIntentionText,
  intentionSaved,
  intentionError,
  savingIntention,
  onAddIntention,
  onUpdateIntention,
  onDeleteIntention,
  onEditIntention,
  recentIntentions = [],
  showRecentIntentions = false,
  setShowRecentIntentions
}) {
  return (
    <div
      className="rounded-2xl p-6 md:p-7 border transition-all duration-200"
      style={{
        backgroundColor: 'var(--accent-soft)',
        borderColor: 'var(--border-subtle)'
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold transition-colors" style={{ color: 'var(--text-primary)' }}>
            Today's one thing
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {recentIntentions && recentIntentions.length > 0 && (
            <button
              onClick={() => setShowRecentIntentions(!showRecentIntentions)}
              className="text-xs px-2.5 py-1 rounded-lg transition-colors"
              style={{
                color: showRecentIntentions ? 'var(--text-primary)' : 'var(--text-muted)',
                backgroundColor: showRecentIntentions ? 'var(--bg-card)' : 'transparent'
              }}
            >
              Recent
            </button>
          )}
          {intentionSaved && (
            <svg className="w-4 h-4 transition-colors reward-pop" style={{ color: 'var(--growth)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
      <p className="text-xs mb-4 -mt-2 transition-colors" style={{ color: 'var(--text-muted)' }}>
        One clear focus beats ten vague ones. What matters most today?
      </p>

      {/* Recent Intentions List */}
      {showRecentIntentions && recentIntentions && recentIntentions.length > 0 && (
        <div className="mb-4 p-3 rounded border transition-colors" style={{ 
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-subtle)'
        }}>
          <p className="text-xs mb-2 transition-colors" style={{ color: 'var(--text-muted)' }}>Recent intentions:</p>
          <div className="space-y-1">
            {recentIntentions.slice(0, 7).map((intention) => (
              <button
                key={intention.id}
                onClick={() => {
                  if (!showAddIntention) {
                    setShowAddIntention(true);
                  }
                  setNewIntention(intention.intention);
                  setShowRecentIntentions(false);
                }}
                className="w-full text-left px-2 py-1 text-xs rounded hover:bg-opacity-50 transition-colors"
                style={{ 
                  color: 'var(--text-primary)',
                  backgroundColor: 'transparent'
                }}
              >
                {intention.intention}
              </button>
            ))}
          </div>
        </div>
      )}
    
      {intentions && intentions.length > 0 ? (
        <div className="space-y-2 mb-4">
          {intentions.map((intention) => (
            <div key={intention.id} className="group flex items-center gap-3">
              {editingIntentionId === intention.id ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={editingIntentionText}
                    onChange={(e) => setEditingIntentionText(e.target.value)}
                    className="flex-1 px-3 py-2 border-b transition-colors focus:outline-none text-sm"
                    style={{ 
                      borderColor: 'var(--border-mid)',
                      color: 'var(--text-primary)'
                    }}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') onUpdateIntention();
                      if (e.key === 'Escape') {
                        setEditingIntentionId(null);
                        setEditingIntentionText('');
                      }
                    }}
                  />
                  <button
                    onClick={onUpdateIntention}
                    className="px-3 py-1 text-xs transition-colors"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingIntentionId(null);
                      setEditingIntentionText('');
                    }}
                    className="px-3 py-1 text-xs transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    value={intention.intention}
                    readOnly
                    className="flex-1 px-3 py-2 border-b transition-colors text-sm bg-transparent"
                    style={{ 
                      borderColor: 'var(--border-subtle)',
                      color: 'var(--text-primary)'
                    }}
                  />
                  <button
                    onClick={() => onEditIntention(intention)}
                    className="px-3 py-1 text-xs transition-colors opacity-0 group-hover:opacity-100"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    EDIT
                  </button>
                  <button
                    onClick={() => onDeleteIntention(intention.id)}
                    className="px-3 py-1 text-xs transition-colors opacity-0 group-hover:opacity-100"
                    style={{ color: 'var(--error)' }}
                  >
                    DELETE
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        showAddIntention ? (
          <div className="mb-4">
            <input
              type="text"
              value={newIntention}
              onChange={(e) => setNewIntention(e.target.value)}
              placeholder="Focus on high-fidelity architectural time management"
              className="w-full px-3 py-2 border-b transition-colors focus:outline-none text-sm"
              style={{ 
                borderColor: 'var(--border-mid)',
                color: 'var(--text-primary)'
              }}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') onAddIntention();
                if (e.key === 'Escape') {
                  setShowAddIntention(false);
                  setNewIntention('');
                }
              }}
            />
          </div>
        ) : (
          <div className="mb-4">
            <input
              type="text"
              placeholder="Focus on high-fidelity architectural time management"
              className="w-full px-3 py-2 border-b transition-colors text-sm"
              style={{ 
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-muted)'
              }}
              onClick={() => setShowAddIntention(true)}
              readOnly
            />
          </div>
        )
      )}
      
      {intentionError && (
        <div className="text-xs transition-colors mb-2" style={{ color: 'var(--error)' }}>
          {intentionError}
        </div>
      )}
    </div>
  );
}
