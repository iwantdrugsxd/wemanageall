import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { user, logout } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleExport = async () => {
    try {
      const response = await fetch('/api/settings/export', {
        credentials: 'include',
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ofa-export-${new Date().toISOString()}.json`;
      a.click();
    } catch (error) {
      console.error('Failed to export:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await fetch('/api/settings/delete', {
        method: 'DELETE',
        credentials: 'include',
      });
      logout();
    } catch (error) {
      console.error('Failed to delete account:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-light transition-colors mb-2" style={{ color: 'var(--text-primary)' }}>
          Settings
        </h1>
        <p className="text-sm transition-colors" style={{ color: 'var(--text-muted)' }}>
          Manage your account and preferences
        </p>
      </div>

      <div className="space-y-6">
        {/* Account */}
        <div 
          className="rounded-lg p-6 border transition-colors"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-subtle)'
          }}
        >
          <h3 className="text-lg font-medium mb-4 transition-colors" style={{ color: 'var(--text-primary)' }}>
            Account
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 transition-colors" style={{ color: 'var(--text-muted)' }}>
                Name
              </label>
              <div className="px-4 py-2 rounded-lg transition-colors" style={{ backgroundColor: 'var(--bg-surface)' }}>
                <p className="text-sm transition-colors" style={{ color: 'var(--text-primary)' }}>
                  {user?.name}
                </p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 transition-colors" style={{ color: 'var(--text-muted)' }}>
                Email
              </label>
              <div className="px-4 py-2 rounded-lg transition-colors" style={{ backgroundColor: 'var(--bg-surface)' }}>
                <p className="text-sm transition-colors" style={{ color: 'var(--text-primary)' }}>
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Data */}
        <div 
          className="rounded-lg p-6 border transition-colors"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-subtle)'
          }}
        >
          <h3 className="text-lg font-medium mb-4 transition-colors" style={{ color: 'var(--text-primary)' }}>
            Data
          </h3>
          <div className="space-y-3">
            <button
              onClick={handleExport}
              className="w-full text-left px-4 py-3 rounded-lg transition-colors"
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
              Export all data
            </button>
            <p className="text-sm transition-colors" style={{ color: 'var(--text-muted)' }}>
              Download a copy of all your data.
            </p>
          </div>
        </div>

        {/* Privacy */}
        <div 
          className="rounded-lg p-6 border transition-colors"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-subtle)'
          }}
        >
          <h3 className="text-lg font-medium mb-4 transition-colors" style={{ color: 'var(--text-primary)' }}>
            Privacy
          </h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input 
                type="checkbox" 
                className="w-5 h-5 rounded transition-colors"
                style={{
                  borderColor: 'var(--border-subtle)',
                  backgroundColor: 'var(--bg-card)'
                }}
              />
              <span className="transition-colors" style={{ color: 'var(--text-primary)' }}>
                Lock entries by default
              </span>
            </label>
            <p className="text-sm transition-colors" style={{ color: 'var(--text-muted)' }}>
              Make all new entries private by default.
            </p>
          </div>
        </div>

        {/* Danger Zone */}
        <div 
          className="rounded-lg p-6 border transition-colors"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-subtle)'
          }}
        >
          <h3 className="text-lg font-medium mb-4 transition-colors" style={{ color: 'var(--text-primary)' }}>
            Danger Zone
          </h3>
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-6 py-2 rounded-lg text-sm transition-colors"
              style={{
                backgroundColor: 'var(--error)',
                color: 'var(--bg-base)'
              }}
            >
              Delete account
            </button>
          ) : (
            <div>
              <p className="text-sm mb-4 transition-colors" style={{ color: 'var(--text-primary)' }}>
                Are you sure? This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  className="px-6 py-2 rounded-lg text-sm transition-colors"
                  style={{
                    backgroundColor: 'var(--error)',
                    color: 'var(--bg-base)'
                  }}
                >
                  Yes, delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-6 py-2 rounded-lg text-sm transition-colors border"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--text-primary)'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

