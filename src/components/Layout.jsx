import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showQuickAction, setShowQuickAction] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const firstName = user?.name?.split(' ')[0] || 'User';
  const initial = firstName.charAt(0).toUpperCase();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/projects', label: 'Projects' },
    { path: '/lists', label: 'Lists' },
    { path: '/calendar', label: 'Calendar' },
    { path: '/emotions', label: 'Unload' },
    { path: '/money', label: 'Money' },
    { path: '/library', label: 'Library' },
    { path: '/settings', label: 'Settings' },
  ];

  // Fetch unread insights count
  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/insights', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        const unread = (data.insights || []).filter(i => !i.seen_at).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      // Silent fail
    }
  };

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      // Refresh every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      
      // Listen for insights updates
      const handleInsightsUpdate = () => {
        fetchUnreadCount();
      };
      window.addEventListener('insights-updated', handleInsightsUpdate);
      
      return () => {
        clearInterval(interval);
        window.removeEventListener('insights-updated', handleInsightsUpdate);
      };
    }
  }, [user, location.pathname]);

  // Handle ⌘K shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowQuickAction(true);
      }
      if (e.key === 'Escape') {
        setShowQuickAction(false);
        setShowUserMenu(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleNavClick = (path) => {
    navigate(path);
    setShowUserMenu(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-300 dark:border-gray-700 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.6)] border border-gray-800/80">
                <span className="font-display text-white text-lg leading-none font-semibold">W</span>
              </div>
              <span className="font-display text-lg font-semibold text-black dark:text-white transition-colors">wemanageall</span>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-black dark:text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                aria-label="Toggle theme"
              >
                {theme === 'light' ? (
                  <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                )}
              </button>
              {/* Date Display - shown on Money page */}
              {location.pathname === '/money' && (
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium transition-colors">
                  {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()}
                </span>
              )}
              
              {/* Notifications Icon */}
              <Link
                to="/notifications"
                className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <svg
                  className={`w-6 h-6 transition-colors ${location.pathname === '/notifications' ? 'text-black dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-black dark:bg-white text-white dark:text-black text-xs font-medium rounded-full flex items-center justify-center transition-colors">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
              
              <button
                onClick={() => setShowQuickAction(true)}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <span>⌘K</span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  <span className="text-black dark:text-white text-sm font-medium transition-colors">{initial}</span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-300 dark:border-gray-700 py-2 z-50 transition-colors">
                    <div className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                      <p className="text-sm font-medium text-black dark:text-white transition-colors">{user?.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors">{user?.email}</p>
                    </div>
                    
                    <div className="py-2">
                      {navItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                          <button
                            key={item.path}
                            onClick={() => handleNavClick(item.path)}
                            className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-3 ${
                              isActive
                                ? 'bg-black/10 dark:bg-white/10 text-black dark:text-white font-medium'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          >
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    <hr className="my-2 border-gray-300 dark:border-gray-700" />
                    
                    <Link
                      to="/pricing"
                      onClick={() => setShowUserMenu(false)}
                      className="block w-full text-left px-4 py-2 text-sm text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      Pricing & Plans
                    </Link>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

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
                  navigate('/dashboard');
                  setShowQuickAction(false);
                }}
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-black dark:text-white"
              >
                Go to Dashboard
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
  );
}
