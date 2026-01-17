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
    <div className="max-w-4xl mx-auto px-6 lg:px-8 py-12">
        <div className="space-y-6">
          {/* Account */}
          <div className="bg-white rounded-2xl p-6 border border-gray-300">
            <h3 className="font-medium text-black mb-4">Account</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 mb-1">Name</p>
                <p className="text-black">{user?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Email</p>
                <p className="text-black">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Data */}
          <div className="bg-white rounded-2xl p-6 border border-gray-300">
            <h3 className="font-medium text-black mb-4">Data</h3>
            <div className="space-y-3">
              <button
                onClick={handleExport}
                className="w-full text-left px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Export all data
              </button>
              <p className="text-sm text-gray-500">Download a copy of all your data.</p>
            </div>
          </div>

          {/* Privacy */}
          <div className="bg-white rounded-2xl p-6 border border-gray-300">
            <h3 className="font-medium text-black mb-4">Privacy</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input type="checkbox" className="w-5 h-5 rounded border-gray-300" />
                <span className="text-black">Lock entries by default</span>
              </label>
              <p className="text-sm text-gray-500">Make all new entries private by default.</p>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-gray-100 rounded-2xl p-6 border text-black">
            <h3 className="font-medium text-black mb-4">Danger Zone</h3>
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-6 py-2 bg-black text-white rounded-xl hover:bg-gray-900 transition-colors"
              >
                Delete account
              </button>
            ) : (
              <div>
                <p className="text-sm text-black mb-4">Are you sure? This cannot be undone.</p>
                <div className="flex gap-3">
                  <button
                    onClick={handleDelete}
                    className="px-6 py-2 bg-black text-white rounded-xl hover:bg-gray-900 transition-colors"
                  >
                    Yes, delete
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-6 py-2 bg-white border text-black text-black rounded-xl hover:bg-gray-100 transition-colors"
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

