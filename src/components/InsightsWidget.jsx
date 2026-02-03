import { useState, useEffect } from 'react';

/**
 * Insights Widget Component
 * Displays Personal Knowledge Engine insights on the Dashboard
 */
export default function InsightsWidget() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dismissedIds, setDismissedIds] = useState(new Set());

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const response = await fetch('/api/insights', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setInsights(data.insights || []);
      }
    } catch (error) {
      console.error('Failed to fetch insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async (insightId) => {
    try {
      const response = await fetch(`/api/insights/${insightId}/dismiss`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        setDismissedIds(prev => new Set([...prev, insightId]));
        // Remove from local state
        setInsights(prev => prev.filter(i => i.id !== insightId));
      }
    } catch (error) {
      console.error('Failed to dismiss insight:', error);
    }
  };

  const handleSeen = async (insightId) => {
    try {
      await fetch(`/api/insights/${insightId}/seen`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      // Silent fail
    }
  };

  // Mark insights as seen when they're displayed
  useEffect(() => {
    insights.forEach(insight => {
      if (!insight.seen_at) {
        handleSeen(insight.id);
      }
    });
  }, [insights]);

  if (loading) {
    return null; // Don't show loading state, just don't render
  }

  if (insights.length === 0) {
    return null; // Don't show widget if no insights
  }

  // Filter out dismissed insights
  const visibleInsights = insights.filter(i => !dismissedIds.has(i.id));

  if (visibleInsights.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 space-y-3">
      {visibleInsights.slice(0, 3).map((insight) => (
        <div
          key={insight.id}
          className="p-4 bg-gradient-to-r from-ofa-calm/10 to-ofa-accent/10 border border-ofa-calm/20 rounded-xl relative group"
        >
          {/* Dismiss button */}
          <button
            onClick={() => handleDismiss(insight.id)}
            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-black"
            aria-label="Dismiss insight"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Insight content */}
          <div className="pr-8">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <div className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-black mb-1">
                  {insight.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {insight.body}
                </p>
                {insight.scope && (
                  <span className="inline-block mt-2 text-xs text-gray-500 uppercase tracking-wide">
                    {insight.scope}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}










