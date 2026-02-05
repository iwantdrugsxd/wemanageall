import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Notifications({ embedded = false } = {}) {
  const { user } = useAuth();
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const [accountFeedback, setAccountFeedback] = useState(null);
  const [generatingFeedback, setGeneratingFeedback] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

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
        // Sort by created_at (newest first)
        const sorted = (data.insights || []).sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );
        setInsights(sorted);
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
        setInsights(prev => prev.filter(i => i.id !== insightId));
        // Trigger navbar badge update
        window.dispatchEvent(new CustomEvent('insights-updated'));
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
      
      // Update local state
      setInsights(prev => prev.map(i => 
        i.id === insightId ? { ...i, seen_at: new Date().toISOString() } : i
      ));
      
      // Trigger a custom event to update navbar badge
      window.dispatchEvent(new CustomEvent('insights-updated'));
    } catch (error) {
      // Silent fail
    }
  };

  const handleMute = async (insightId, scope) => {
    try {
      const response = await fetch(`/api/insights/${insightId}/mute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ scope }),
      });

      if (response.ok) {
        setInsights(prev => prev.filter(i => i.id !== insightId));
        // Trigger navbar badge update
        window.dispatchEvent(new CustomEvent('insights-updated'));
      }
    } catch (error) {
      console.error('Failed to mute insight:', error);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getScopeIcon = (scope) => {
    const icons = {
      emotion: '💭',
      daily: '📝',
      money: '💰',
      project: '🚀',
      weekly: '📅',
      monthly: '📊',
    };
    return icons[scope] || '💡';
  };

  const getScopeColor = (scope) => {
    const colors = {
      emotion: 'text-black text-black',
      daily: 'bg-gray-200 text-black',
      money: 'bg-gray-200 text-black',
      project: 'bg-indigo-100 text-indigo-700',
      weekly: 'bg-orange-100 text-orange-700',
      monthly: 'bg-pink-100 text-pink-700',
    };
    return colors[scope] || 'bg-gray-200 text-black';
  };

  const filteredInsights = insights.filter(insight => {
    if (filter === 'unread') return !insight.seen_at;
    if (filter === 'read') return insight.seen_at;
    return true;
  });

  const handleGenerateFeedback = async () => {
    setGeneratingFeedback(true);
    try {
      const response = await fetch('/api/insights/account-feedback', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setAccountFeedback(data.feedback);
        setShowFeedbackModal(true);
        // Refresh insights to show the new feedback
        await fetchInsights();
      } else {
        alert('Failed to generate feedback. Please try again.');
      }
    } catch (error) {
      console.error('Failed to generate feedback:', error);
      alert('Network error. Please check your connection.');
    } finally {
      setGeneratingFeedback(false);
    }
  };

  const formatFeedbackBody = (body) => {
    // Convert markdown-style formatting to HTML
    const lines = body.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <strong key={idx} className="block mt-3 mb-1 text-black" style={{ color: '#000000' }}>{line.replace(/\*\*/g, '')}</strong>;
      }
      if (line.startsWith('•')) {
        return <div key={idx} className="ml-4 text-sm text-black" style={{ color: '#000000' }}>{line}</div>;
      }
      if (line.trim() === '') {
        return <br key={idx} />;
      }
      return <div key={idx} className="text-sm text-black mb-2" style={{ color: '#000000' }}>{line}</div>;
    });
  };

  const unreadCount = insights.filter(i => !i.seen_at).length;

  if (loading) {
    if (embedded) {
      return (
        <div className="py-6 text-center transition-colors" style={{ color: 'var(--text-muted)' }}>
          Loading notifications...
        </div>
      );
    }
    return (
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-12">
        <div className="text-center text-gray-600">Loading notifications...</div>
      </div>
    );
  }

  if (embedded) {
    return (
      <div>
        {/* Compact Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium transition-colors" style={{ color: 'var(--text-primary)' }}>
            Notifications
          </h2>
          <button
            onClick={handleGenerateFeedback}
            disabled={generatingFeedback}
            className="px-3 py-1.5 rounded-lg text-sm transition-colors disabled:opacity-50"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--bg-base)'
            }}
          >
            {generatingFeedback ? 'Generating...' : 'Get AI Feedback'}
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'text-[var(--text-primary)] border-b-2'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
            style={filter === 'all' ? { borderColor: 'var(--accent)' } : {}}
          >
            All {insights.length > 0 && `(${insights.length})`}
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 text-sm font-medium transition-colors relative ${
              filter === 'unread'
                ? 'text-[var(--text-primary)] border-b-2'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
            style={filter === 'unread' ? { borderColor: 'var(--accent)' } : {}}
          >
            Unread
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full" style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-base)' }}>
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              filter === 'read'
                ? 'text-[var(--text-primary)] border-b-2'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
            style={filter === 'read' ? { borderColor: 'var(--accent)' } : {}}
          >
            Read
          </button>
        </div>

        {/* Notifications List */}
        {filteredInsights.length === 0 ? (
          <div className="text-center py-12">
          <div className="text-6xl mb-4">🔔</div>
          <p className="text-gray-600 text-lg mb-2">
            {filter === 'unread' 
              ? 'No unread notifications' 
              : filter === 'read'
              ? 'No read notifications'
              : 'No notifications yet'}
          </p>
          <p className="text-gray-500 text-sm">
            {filter === 'all' 
              ? 'Your Personal Knowledge Engine will show insights here as patterns emerge.'
              : 'Try switching to another filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-1 bg-white rounded-xl border border-gray-300 overflow-hidden">
          {filteredInsights.map((insight) => {
            const isUnread = !insight.seen_at;
            
            return (
              <div
                key={insight.id}
                className={`p-4 border-b border-gray-300 last:border-b-0 transition-colors ${
                  isUnread ? 'bg-black/5' : 'bg-white'
                } hover:bg-gray-100`}
                onClick={() => {
                  if (isUnread) {
                    handleSeen(insight.id);
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  {/* Icon/Avatar */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full ${getScopeColor(insight.scope)} flex items-center justify-center text-lg`}>
                    {getScopeIcon(insight.scope)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex-1">
                        <h3 className={`text-sm font-medium ${isUnread ? 'text-black' : 'text-gray-600'}`}>
                          {insight.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                          {insight.body}
                        </p>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {formatTimeAgo(insight.created_at)}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMute(insight.id, insight.scope);
                            }}
                            className="p-1.5 hover:bg-gray-200 rounded-full transition-colors"
                            title="Mute this type"
                          >
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDismiss(insight.id);
                            }}
                            className="p-1.5 hover:bg-gray-200 rounded-full transition-colors"
                            title="Dismiss"
                          >
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Scope Badge */}
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getScopeColor(insight.scope)}`}>
                        {insight.scope}
                      </span>
                      {isUnread && (
                        <span className="w-2 h-2 bg-black rounded-full"></span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

        {/* Empty State for specific filters */}
        {filteredInsights.length === 0 && filter !== 'all' && (
          <div className="mt-8 text-center">
            <button
              onClick={() => setFilter('all')}
              className="text-sm font-medium transition-colors"
              style={{ color: 'var(--text-primary)' }}
            >
              View all notifications
            </button>
          </div>
        )}

        {/* Account Feedback Modal */}
        {showFeedbackModal && accountFeedback && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowFeedbackModal(false)}
        >
          <div
            className="bg-white rounded-lg border border-gray-200 shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl text-black mb-1" style={{ color: '#000000' }}>{accountFeedback.title}</h2>
                  <p className="text-xs text-black" style={{ color: '#000000', opacity: 0.5 }}>
                    Generated {new Date(accountFeedback.generated_at).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setShowFeedbackModal(false)}
                  className="text-black hover:bg-gray-100 rounded p-1 transition-colors"
                  style={{ color: '#000000' }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Feedback Content */}
              <div className="mb-6">
                {formatFeedbackBody(accountFeedback.body)}
              </div>

              {/* Stats Summary */}
              {accountFeedback.stats && (
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm text-black mb-3" style={{ color: '#000000' }}>Account Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-2 bg-gray-50 rounded">
                      <div className="text-xs text-black mb-1" style={{ color: '#000000', opacity: 0.6 }}>Projects</div>
                      <div className="text-base text-black" style={{ color: '#000000' }}>{accountFeedback.stats.projects?.total || 0}</div>
                    </div>
                    <div className="p-2 bg-gray-50 rounded">
                      <div className="text-xs text-black mb-1" style={{ color: '#000000', opacity: 0.6 }}>Tasks</div>
                      <div className="text-base text-black" style={{ color: '#000000' }}>{accountFeedback.stats.tasks?.total || 0}</div>
                    </div>
                    <div className="p-2 bg-gray-50 rounded">
                      <div className="text-xs text-black mb-1" style={{ color: '#000000', opacity: 0.6 }}>Expenses</div>
                      <div className="text-base text-black" style={{ color: '#000000' }}>{accountFeedback.stats.expenses?.count || 0}</div>
                    </div>
                    <div className="p-2 bg-gray-50 rounded">
                      <div className="text-xs text-black mb-1" style={{ color: '#000000', opacity: 0.6 }}>Lists</div>
                      <div className="text-base text-black" style={{ color: '#000000' }}>{accountFeedback.stats.lists || 0}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowFeedbackModal(false)}
                  className="px-4 py-2 text-sm text-black hover:bg-gray-100 rounded transition-colors"
                  style={{ color: '#000000' }}
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowFeedbackModal(false);
                    handleGenerateFeedback();
                  }}
                  className="px-4 py-2 text-sm bg-black text-white rounded hover:bg-black/90 transition-colors"
                  style={{ backgroundColor: '#000000' }}
                >
                  Refresh Feedback
                </button>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl md:text-4xl text-black mb-2">Notifications</h1>
          <p className="text-gray-600">Insights and patterns from your Personal Knowledge Engine</p>
        </div>
        <button
          onClick={handleGenerateFeedback}
          disabled={generatingFeedback}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-black/90 transition-colors disabled:opacity-50 text-sm"
          style={{ backgroundColor: '#000000' }}
        >
          {generatingFeedback ? 'Generating...' : 'Get AI Feedback'}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-300">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'text-black border-b-2 border-ofa-ink'
              : 'text-gray-500 hover:text-black'
          }`}
        >
          All {insights.length > 0 && `(${insights.length})`}
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 text-sm font-medium transition-colors relative ${
            filter === 'unread'
              ? 'text-black border-b-2 border-ofa-ink'
              : 'text-gray-500 hover:text-black'
          }`}
        >
          Unread
          {unreadCount > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-black text-white rounded-full">
              {unreadCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setFilter('read')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            filter === 'read'
              ? 'text-black border-b-2 border-ofa-ink'
              : 'text-gray-500 hover:text-black'
          }`}
        >
          Read
        </button>
      </div>

      {/* Notifications List */}
      {filteredInsights.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔔</div>
          <p className="text-gray-600 text-lg mb-2">
            {filter === 'unread' 
              ? 'No unread notifications' 
              : filter === 'read'
              ? 'No read notifications'
              : 'No notifications yet'}
          </p>
          <p className="text-gray-500 text-sm">
            {filter === 'all' 
              ? 'Your Personal Knowledge Engine will show insights here as patterns emerge.'
              : 'Try switching to another filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-1 bg-white rounded-xl border border-gray-300 overflow-hidden">
          {filteredInsights.map((insight) => {
            const isUnread = !insight.seen_at;
            
            return (
              <div
                key={insight.id}
                className={`p-4 border-b border-gray-300 last:border-b-0 transition-colors ${
                  isUnread ? 'bg-black/5' : 'bg-white'
                } hover:bg-gray-100`}
                onClick={() => {
                  if (isUnread) {
                    handleSeen(insight.id);
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  {/* Icon/Avatar */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full ${getScopeColor(insight.scope)} flex items-center justify-center text-lg`}>
                    {getScopeIcon(insight.scope)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex-1">
                        <h3 className={`text-sm font-medium ${isUnread ? 'text-black' : 'text-gray-600'}`}>
                          {insight.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                          {insight.body}
                        </p>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {formatTimeAgo(insight.created_at)}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMute(insight.id, insight.scope);
                            }}
                            className="p-1.5 hover:bg-gray-200 rounded-full transition-colors"
                            title="Mute this type"
                          >
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDismiss(insight.id);
                            }}
                            className="p-1.5 hover:bg-gray-200 rounded-full transition-colors"
                            title="Dismiss"
                          >
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Scope Badge */}
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getScopeColor(insight.scope)}`}>
                        {insight.scope}
                      </span>
                      {isUnread && (
                        <span className="w-2 h-2 bg-black rounded-full"></span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State for specific filters */}
      {filteredInsights.length === 0 && filter !== 'all' && (
        <div className="mt-8 text-center">
          <button
            onClick={() => setFilter('all')}
            className="text-black hover:text-black-deep text-sm font-medium"
          >
            View all notifications
          </button>
        </div>
      )}

      {/* Account Feedback Modal */}
      {showFeedbackModal && accountFeedback && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowFeedbackModal(false)}
        >
          <div
            className="bg-white rounded-lg border border-gray-200 shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl text-black mb-1" style={{ color: '#000000' }}>{accountFeedback.title}</h2>
                  <p className="text-xs text-black" style={{ color: '#000000', opacity: 0.5 }}>
                    Generated {new Date(accountFeedback.generated_at).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setShowFeedbackModal(false)}
                  className="text-black hover:bg-gray-100 rounded p-1 transition-colors"
                  style={{ color: '#000000' }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Feedback Content */}
              <div className="mb-6">
                {formatFeedbackBody(accountFeedback.body)}
              </div>

              {/* Stats Summary */}
              {accountFeedback.stats && (
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm text-black mb-3" style={{ color: '#000000' }}>Account Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-2 bg-gray-50 rounded">
                      <div className="text-xs text-black mb-1" style={{ color: '#000000', opacity: 0.6 }}>Projects</div>
                      <div className="text-base text-black" style={{ color: '#000000' }}>{accountFeedback.stats.projects?.total || 0}</div>
                    </div>
                    <div className="p-2 bg-gray-50 rounded">
                      <div className="text-xs text-black mb-1" style={{ color: '#000000', opacity: 0.6 }}>Tasks</div>
                      <div className="text-base text-black" style={{ color: '#000000' }}>{accountFeedback.stats.tasks?.total || 0}</div>
                    </div>
                    <div className="p-2 bg-gray-50 rounded">
                      <div className="text-xs text-black mb-1" style={{ color: '#000000', opacity: 0.6 }}>Expenses</div>
                      <div className="text-base text-black" style={{ color: '#000000' }}>{accountFeedback.stats.expenses?.count || 0}</div>
                    </div>
                    <div className="p-2 bg-gray-50 rounded">
                      <div className="text-xs text-black mb-1" style={{ color: '#000000', opacity: 0.6 }}>Lists</div>
                      <div className="text-base text-black" style={{ color: '#000000' }}>{accountFeedback.stats.lists || 0}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowFeedbackModal(false)}
                  className="px-4 py-2 text-sm text-black hover:bg-gray-100 rounded transition-colors"
                  style={{ color: '#000000' }}
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowFeedbackModal(false);
                    handleGenerateFeedback();
                  }}
                  className="px-4 py-2 text-sm bg-black text-white rounded hover:bg-black/90 transition-colors"
                  style={{ backgroundColor: '#000000' }}
                >
                  Refresh Feedback
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

