import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Admin Center - Workspace settings, members, billing, and permissions
 * Phase 6: Enterprise admin interface (frontend only)
 */
export default function Admin() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/subscriptions/current', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-light transition-colors mb-2" style={{ color: 'var(--text-primary)' }}>
          Admin Center
        </h1>
        <p className="text-sm transition-colors" style={{ color: 'var(--text-muted)' }}>
          Manage workspace settings, members, and billing
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workspace Info */}
        <div 
          className="lg:col-span-2 rounded-lg p-6 border transition-colors"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-subtle)'
          }}
        >
          <h2 className="text-lg font-medium mb-4 transition-colors" style={{ color: 'var(--text-primary)' }}>
            Workspace Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 transition-colors" style={{ color: 'var(--text-muted)' }}>
                Workspace Name
              </label>
              <div className="px-4 py-2 rounded-lg transition-colors" style={{ backgroundColor: 'var(--bg-surface)' }}>
                <p className="text-sm transition-colors" style={{ color: 'var(--text-primary)' }}>
                  Personal
                </p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 transition-colors" style={{ color: 'var(--text-muted)' }}>
                Owner
              </label>
              <div className="px-4 py-2 rounded-lg transition-colors" style={{ backgroundColor: 'var(--bg-surface)' }}>
                <p className="text-sm transition-colors" style={{ color: 'var(--text-primary)' }}>
                  {user?.name} ({user?.email})
                </p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 transition-colors" style={{ color: 'var(--text-muted)' }}>
                Created
              </label>
              <div className="px-4 py-2 rounded-lg transition-colors" style={{ backgroundColor: 'var(--bg-surface)' }}>
                <p className="text-sm transition-colors" style={{ color: 'var(--text-primary)' }}>
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          {/* Current Plan */}
          <div 
            className="rounded-lg p-6 border transition-colors"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-subtle)'
            }}
          >
            <h2 className="text-lg font-medium mb-4 transition-colors" style={{ color: 'var(--text-primary)' }}>
              Current Plan
            </h2>
            {loading ? (
              <p className="text-sm transition-colors" style={{ color: 'var(--text-muted)' }}>Loading...</p>
            ) : (
              <div>
                <p className="text-2xl font-medium mb-2 transition-colors capitalize" style={{ color: 'var(--text-primary)' }}>
                  {subscription?.plan_type === 'premium' ? 'Starter' : 
                   subscription?.plan_type === 'team_starter' ? 'Team' : 
                   subscription?.plan_type ? subscription.plan_type : 'Free'}
                </p>
                {subscription?.status && (
                  <p className="text-xs mb-4 transition-colors capitalize" style={{ color: 'var(--text-muted)' }}>
                    Status: {subscription.status}
                  </p>
                )}
                <Link
                  to="/pricing"
                  className="block w-full text-center px-4 py-2 rounded-lg text-sm transition-colors"
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: 'var(--bg-base)'
                  }}
                >
                  Manage Plan
                </Link>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div 
            className="rounded-lg p-6 border transition-colors"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-subtle)'
            }}
          >
            <h2 className="text-lg font-medium mb-4 transition-colors" style={{ color: 'var(--text-primary)' }}>
              Quick Links
            </h2>
            <div className="space-y-2">
              <Link
                to="/organizations"
                className="block w-full text-left px-4 py-2 rounded-lg text-sm transition-colors"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-primary)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'var(--bg-elevated)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'var(--bg-surface)';
                }}
              >
                Members & Teams
              </Link>
              <Link
                to="/pricing"
                className="block w-full text-left px-4 py-2 rounded-lg text-sm transition-colors"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-primary)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'var(--bg-elevated)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'var(--bg-surface)';
                }}
              >
                Billing & Plans
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Members Section */}
      <div 
        className="mt-6 rounded-lg p-6 border transition-colors"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-subtle)'
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium transition-colors" style={{ color: 'var(--text-primary)' }}>
            Members
          </h2>
          <Link
            to="/organizations"
            className="px-4 py-2 rounded-lg text-sm transition-colors"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--bg-base)'
            }}
          >
            Manage Members
          </Link>
        </div>
        <p className="text-sm transition-colors" style={{ color: 'var(--text-muted)' }}>
          Manage team members and permissions. <Link to="/organizations" className="underline">Go to Organizations</Link>
        </p>
      </div>

      {/* Roles & Permissions (Placeholder) */}
      <div 
        className="mt-6 rounded-lg p-6 border transition-colors"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-subtle)'
        }}
      >
        <h2 className="text-lg font-medium mb-4 transition-colors" style={{ color: 'var(--text-primary)' }}>
          Roles & Permissions
        </h2>
        <p className="text-sm transition-colors" style={{ color: 'var(--text-muted)' }}>
          Coming soon. Advanced role management and permissions will be available here.
        </p>
      </div>
    </div>
  );
}
