import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { SearchProvider } from '../../context/SearchContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { cn } from '../../lib/cn';

export default function AppShell({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  // Initialize sidebar collapsed state from localStorage
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar_collapsed');
    return saved === 'true';
  });
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showQuickAction, setShowQuickAction] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [usage, setUsage] = useState({ projects: null, seats: null, storage: null });

  // Fetch subscription and usage data
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
      // Silent fail
    }
  };

  const fetchUsage = async () => {
    try {
      const projectsRes = await fetch('/api/projects?archived=false', {
        credentials: 'include',
      });
      if (projectsRes.ok) {
        const projectsData = await projectsRes.json();
        setUsage(prev => ({ ...prev, projects: projectsData.projects?.length || 0 }));
      }
      setUsage(prev => ({ ...prev, seats: null, storage: null }));
    } catch (error) {
      // Silent fail
    }
  };

  useEffect(() => {
    if (user) {
      fetchSubscription();
      fetchUsage();
    }
  }, [user, location.pathname]);

  return (
    <SearchProvider>
      <div className="app min-h-screen flex" style={{ backgroundColor: 'var(--bg-base)' }}>
        {/* Sidebar */}
        <Sidebar 
          collapsed={sidebarCollapsed} 
          onToggleCollapse={setSidebarCollapsed}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Topbar */}
          <Topbar onQuickAction={() => setShowQuickAction(true)} />

          {/* Main Content */}
          <main className="flex-1 overflow-auto">{children}</main>
        </div>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setShowMobileMenu(false)}
          />
          <div
            className="fixed left-0 top-0 bottom-0 w-64 z-50 lg:hidden flex flex-col border-r transition-colors"
            style={{
              backgroundColor: 'var(--bg-base)',
              borderColor: 'var(--border-subtle)'
            }}
          >
            {/* Mobile menu content - simplified for Phase 1 */}
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
              <span className="font-display text-lg font-semibold transition-colors" style={{ color: 'var(--text-primary)' }}>
                WeManageAll
              </span>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="p-2 rounded-lg transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Quick Action Modal */}
      {showQuickAction && (
        <div
          className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center transition-colors"
          onClick={() => setShowQuickAction(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 border border-gray-300 dark:border-gray-700 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-xl text-black dark:text-white mb-4 transition-colors">Quick Actions</h2>
            <div className="space-y-2">
              <button
                onClick={() => {
                  navigate('/home');
                  setShowQuickAction(false);
                }}
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-black dark:text-white"
              >
                Go to Home
              </button>
              <button
                onClick={() => {
                  navigate('/money?action=add-expense');
                  setShowQuickAction(false);
                }}
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-black dark:text-white"
              >
                Log expense
              </button>
            </div>
            <button
              onClick={() => setShowQuickAction(false)}
              className="mt-4 w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
            >
              Press ESC to close
            </button>
          </div>
        </div>
      )}
      </div>
    </SearchProvider>
  );
}
