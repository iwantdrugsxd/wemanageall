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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading list...</p>
        </div>
      </div>
    );
  }

  if (error || !list) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <h1 className="text-2xl font-semibold text-black mb-2">List not available</h1>
          <p className="text-gray-600">
            {error || 'This list may have been unshared or the link is invalid.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-6">
        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-300 p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl" style={{ backgroundColor: '#000000' }}>
              {list.icon || '📋'}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-semibold text-black mb-2">{list.name}</h1>
              {list.description && (
                <p className="text-gray-600">{list.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Items List */}
        <div className="bg-white rounded-xl border border-gray-300 p-6">
          <h2 className="text-lg font-semibold text-black mb-4">Items</h2>
          {list.items && list.items.length > 0 ? (
            <div className="space-y-3">
              {list.items.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${
                    item.is_done
                      ? 'bg-gray-50 border-gray-200'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <div className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                    item.is_done
                      ? 'bg-black border-black'
                      : 'border-gray-300'
                  }`}>
                    {item.is_done && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-black ${item.is_done ? 'line-through text-gray-500' : ''}`}>
                      {item.title}
                    </p>
                    {item.note && (
                      <p className="text-sm text-gray-600 mt-1">{item.note}</p>
                    )}
                    {item.tag && (
                      <span className="inline-block mt-2 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                        {item.tag}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No items in this list yet.</p>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            This is a read-only view of a shared list.
          </p>
        </div>
      </div>
    </div>
  );
}
