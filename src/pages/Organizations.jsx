import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Organizations() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [newOrg, setNewOrg] = useState({ name: '', description: '' });
  const [joinCode, setJoinCode] = useState('');
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const response = await fetch('/api/organizations', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data.organizations || []);
      }
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrganization = async (e) => {
    e.preventDefault();
    setCreating(true);
    
    try {
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newOrg),
      });
      
      if (response.ok) {
        const data = await response.json();
        await fetchOrganizations();
        setShowCreateModal(false);
        setNewOrg({ name: '', description: '' });
        // Switch to the new organization
        await switchToOrganization(data.organization.id);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create organization');
      }
    } catch (error) {
      console.error('Failed to create organization:', error);
      alert('Network error. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const switchToOrganization = async (orgId) => {
    try {
      const response = await fetch(`/api/organizations/${orgId}/switch`, {
        method: 'PATCH',
        credentials: 'include',
      });
      
      if (response.ok) {
        // Reload page to update context
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to switch organization:', error);
    }
  };

  const switchToIndividual = async () => {
    try {
      const response = await fetch('/api/organizations/switch/individual', {
        method: 'PATCH',
        credentials: 'include',
      });
      
      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to switch to individual:', error);
    }
  };

  const handleJoinByCode = async (e) => {
    e.preventDefault();
    setJoining(true);
    
    try {
      const response = await fetch('/api/organizations/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code: joinCode.toUpperCase().trim() }),
      });
      
      if (response.ok) {
        const data = await response.json();
        await fetchOrganizations();
        setShowJoinModal(false);
        setJoinCode('');
        // Switch to the joined organization
        await switchToOrganization(data.organization.id);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to join workspace');
      }
    } catch (error) {
      console.error('Failed to join organization:', error);
      alert('Network error. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  const copyWorkspaceCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-serif text-black mb-2">Workspaces</h1>
          <p className="text-gray-600">Manage your teams and organizations</p>
        </div>

        {/* Mode Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Individual Mode */}
          <div
            onClick={switchToIndividual}
            className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
              !user?.current_organization_id
                ? 'border-black bg-black text-white'
                : 'border-gray-300 hover:border-black'
            }`}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                !user?.current_organization_id ? 'bg-white/20' : 'bg-gray-100'
              }`}>
                <span className="text-2xl">👤</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold">Individual</h3>
                <p className="text-sm opacity-70">Personal workspace</p>
              </div>
            </div>
            <p className="text-sm opacity-80">
              Use OFA for your personal productivity and life management.
            </p>
            {!user?.current_organization_id && (
              <div className="mt-4 text-xs font-semibold">✓ Active</div>
            )}
          </div>

          {/* Team Mode */}
          <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-black">Team Workspace</h3>
                <p className="text-sm text-gray-600">Create or join a team</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Collaborate with your team on projects, tasks, and goals.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-black/90 transition-colors text-sm font-medium"
              >
                Create Workspace
              </button>
              <button
                onClick={() => setShowJoinModal(true)}
                className="flex-1 px-4 py-2 border border-gray-300 text-black rounded-lg hover:border-black transition-colors text-sm font-medium"
              >
                Join by Code
              </button>
            </div>
          </div>
        </div>

        {/* Existing Organizations */}
        {organizations.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-black mb-4">Your Workspaces</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {organizations.map((org) => (
                <div
                  key={org.id}
                  onClick={() => switchToOrganization(org.id)}
                  className={`p-6 border rounded-lg cursor-pointer transition-all ${
                    user?.current_organization_id === org.id
                      ? 'border-black bg-black text-white'
                      : 'border-gray-300 hover:border-black'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">{org.name}</h3>
                      {org.description && (
                        <p className={`text-sm ${user?.current_organization_id === org.id ? 'opacity-80' : 'text-gray-600'}`}>
                          {org.description}
                        </p>
                      )}
                    </div>
                    {user?.current_organization_id === org.id && (
                      <span className="text-xs font-semibold">Active</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs">
                      <span className={user?.current_organization_id === org.id ? 'opacity-70' : 'text-gray-500'}>
                        {org.member_count || 0} members
                      </span>
                      <span className={`px-2 py-1 rounded ${
                        user?.current_organization_id === org.id ? 'bg-white/20' : 'bg-gray-100'
                      }`}>
                        {org.role}
                      </span>
                    </div>
                    {org.workspace_code && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyWorkspaceCode(org.workspace_code);
                        }}
                        className={`text-xs px-3 py-1 rounded border transition-all ${
                          user?.current_organization_id === org.id
                            ? 'border-white/30 hover:bg-white/10 text-white'
                            : 'border-gray-300 hover:border-black text-gray-600'
                        }`}
                        title="Copy workspace code"
                      >
                        {copiedCode === org.workspace_code ? '✓ Copied' : org.workspace_code}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Join by Code Modal */}
        {showJoinModal && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowJoinModal(false)}
          >
            <div
              className="bg-white rounded-lg border border-gray-200 shadow-xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-black mb-1">Join Workspace</h2>
                    <p className="text-sm text-gray-600">Enter the workspace code to join</p>
                  </div>
                  <button
                    onClick={() => setShowJoinModal(false)}
                    className="text-gray-500 hover:text-black"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleJoinByCode} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Workspace Code</label>
                    <input
                      type="text"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      placeholder="Enter 8-character code"
                      maxLength={8}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black text-center text-2xl font-mono tracking-widest uppercase"
                    />
                    <p className="mt-2 text-xs text-gray-500 text-center">
                      Ask your workspace admin for the code
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowJoinModal(false)}
                      className="px-4 py-2 text-sm text-black hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={joining || !joinCode.trim()}
                      className="px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-black/90 disabled:opacity-50 transition-colors"
                    >
                      {joining ? 'Joining...' : 'Join Workspace'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Create Organization Modal */}
        {showCreateModal && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <div
              className="bg-white rounded-lg border border-gray-200 shadow-xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-black mb-1">Create Workspace</h2>
                    <p className="text-sm text-gray-600">Start collaborating with your team</p>
                  </div>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-500 hover:text-black"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleCreateOrganization} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Workspace Name</label>
                    <input
                      type="text"
                      value={newOrg.name}
                      onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })}
                      placeholder="e.g. Acme Startup"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Description (Optional)</label>
                    <textarea
                      value={newOrg.description}
                      onChange={(e) => setNewOrg({ ...newOrg, description: e.target.value })}
                      placeholder="What is this workspace for?"
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 text-sm text-black hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creating || !newOrg.name.trim()}
                      className="px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-black/90 disabled:opacity-50 transition-colors"
                    >
                      {creating ? 'Creating...' : 'Create Workspace'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

