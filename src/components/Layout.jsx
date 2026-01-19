import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
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
    <div className="min-h-screen bg-white">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-300">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
                <span className="font-display text-white text-sm font-semibold">O</span>
              </div>
              <span className="font-display text-lg font-semibold text-black">OFA</span>
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
                        ? 'text-black'
                        : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
              {/* Date Display - shown on Money page */}
              {location.pathname === '/money' && (
                <span className="text-sm text-gray-600 font-medium">
                  {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()}
                </span>
              )}
              
              {/* Notifications Icon */}
              <Link
                to="/notifications"
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg
                  className={`w-6 h-6 ${location.pathname === '/notifications' ? 'text-black' : 'text-gray-600'}`}
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
                  <span className="absolute top-1 right-1 w-5 h-5 bg-black text-white text-xs font-medium rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
              
              <button
                onClick={() => setShowQuickAction(true)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                <span>⌘K</span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                >
                  <span className="text-black text-sm font-medium">{initial}</span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-300 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-300">
                      <p className="text-sm font-medium text-black">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
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
                                ? 'bg-black/10 text-black font-medium'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    <hr className="my-2 border-gray-300" />
                    
                    <Link
                      to="/pricing"
                      onClick={() => setShowUserMenu(false)}
                      className="block w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-100 transition-colors"
                    >
                      Pricing & Plans
                    </Link>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-100 transition-colors"
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
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={() => setShowQuickAction(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 border border-gray-300"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-xl text-black mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button
                onClick={() => {
                  navigate('/dashboard');
                  setShowQuickAction(false);
                }}
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-100 transition-colors text-black"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => {
                  navigate('/money?action=add-expense');
                  setShowQuickAction(false);
                }}
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-100 transition-colors text-black"
              >
                Log expense
              </button>
            </div>
            <button
              onClick={() => setShowQuickAction(false)}
              className="mt-4 w-full px-4 py-2 text-sm text-gray-600 hover:text-black transition-colors"
            >
              Press ESC to close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
