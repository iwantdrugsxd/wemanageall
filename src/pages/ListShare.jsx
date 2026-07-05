import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

export default function ListShare() {
  const { code } = useParams();
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (code) {
      fetchSharedList();
    }
  }, [code]);

  const fetchSharedList = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/lists/share/${code}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setList(data.list);
      } else {
        setError('List not found or not available');
      }
    } catch (error) {
      console.error('Failed to fetch shared list:', error);
      setError('Failed to load list');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-surface)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--text-secondary)]">Loading list...</p>
        </div>
      </div>
    );
  }

  if (error || !list) {
    return (
      <div className="min-h-screen bg-[var(--bg-surface)] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">List not available</h1>
          <p className="text-[var(--text-secondary)]">
            {error || 'This list may have been unshared or the link is invalid.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-surface)] py-12">
      <div className="max-w-2xl mx-auto px-6">
        {/* Header */}
        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl" style={{ backgroundColor: '#000000' }}>
              {list.icon || '📋'}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">{list.name}</h1>
              {list.description && (
                <p className="text-[var(--text-secondary)]">{list.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Items List */}
        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] p-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Items</h2>
          {list.items && list.items.length > 0 ? (
            <div className="space-y-3">
              {list.items.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${
                    item.is_done
                      ? 'bg-[var(--bg-surface)] border-[var(--border-subtle)]'
                      : 'bg-[var(--bg-card)] border-[var(--border-subtle)]'
                  }`}
                >
                  <div className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                    item.is_done
                      ? 'bg-[var(--accent)] border-[var(--accent)]'
                      : 'border-[var(--border-subtle)]'
                  }`}>
                    {item.is_done && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-[var(--text-primary)] ${item.is_done ? 'line-through text-[var(--text-muted)]' : ''}`}>
                      {item.title}
                    </p>
                    {item.note && (
                      <p className="text-sm text-[var(--text-secondary)] mt-1">{item.note}</p>
                    )}
                    {item.tag && (
                      <span className="inline-block mt-2 px-2 py-0.5 text-xs bg-[var(--bg-surface)] text-[var(--text-secondary)] rounded">
                        {item.tag}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[var(--text-muted)] text-center py-8">No items in this list yet.</p>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-[var(--text-muted)]">
            This is a read-only view of a shared list.
          </p>
        </div>
      </div>
    </div>
  );
}
