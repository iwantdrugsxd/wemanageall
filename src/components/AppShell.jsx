import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function AppShell({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showQuickAction, setShowQuickAction] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [usage, setUsage] = useState({ projects: null, seats: null, storage: null });

  const firstName = user?.name?.split(' ')[0] || 'User';
  const initial = firstName.charAt(0).toUpperCase();

  // Primary navigation items (4 screens)
  const primaryNavItems = [
    { path: '/home', label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { path: '/projects', label: 'Projects', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { path: '/work', label: 'Work', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    { path: '/docs', label: 'Docs', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
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
      // Fetch projects count
      const projectsRes = await fetch('/api/projects?archived=false', {
        credentials: 'include',
      });
      if (projectsRes.ok) {
        const projectsData = await projectsRes.json();
        setUsage(prev => ({ ...prev, projects: projectsData.projects?.length || 0 }));
      }

      // Fetch organization members (seats) if applicable
      // This is a placeholder - adjust based on your API
      setUsage(prev => ({ ...prev, seats: null, storage: null }));
    } catch (error) {
      // Silent fail
    }
  };

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      fetchSubscription();
      fetchUsage();
      const interval = setInterval(fetchUnreadCount, 30000);
      
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

  const isActive = (path) => {
    if (path === '/home') {
      return location.pathname === '/home' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--bg-base)' }}>
      {/* Left Sidebar */}
      <aside 
        className={`hidden lg:flex flex-col border-r transition-all duration-300 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
        style={{ 
          backgroundColor: 'var(--bg-base)', 
          borderColor: 'var(--border-subtle)' 
        }}
      >
        {/* Logo */}
        <div className="p-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <Link to="/home" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.6)] border border-gray-800/80 flex-shrink-0">
              <span className="font-display text-white text-lg leading-none font-semibold">W</span>
            </div>
            {!sidebarCollapsed && (
              <span className="font-display text-lg font-semibold transition-colors" style={{ color: 'var(--text-primary)' }}>
                WeManageAll
              </span>
            )}
          </Link>
        </div>

        {/* Workspace Switcher (Placeholder) */}
        {!sidebarCollapsed && (
          <div className="p-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
            <div className="px-3 py-2 rounded-lg transition-colors" style={{ backgroundColor: 'var(--bg-surface)' }}>
              <p className="text-xs font-medium mb-1 transition-colors" style={{ color: 'var(--text-muted)' }}>
                Workspace
              </p>
              <p className="text-sm transition-colors" style={{ color: 'var(--text-primary)' }}>
                Personal
              </p>
            </div>
          </div>
        )}

        {/* Primary Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {primaryNavItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  active ? 'font-medium' : ''
                }`}
                style={{
                  backgroundColor: active ? 'var(--bg-surface)' : 'transparent',
                  color: active ? 'var(--text-primary)' : 'var(--text-muted)'
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <svg 
                  className="w-5 h-5 flex-shrink-0" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                {!sidebarCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Plan Badge + Usage Meter */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t space-y-3" style={{ borderColor: 'var(--border-subtle)' }}>
            {/* Plan Badge */}
            <div className="px-3 py-2 rounded-lg transition-colors" style={{ backgroundColor: 'var(--bg-surface)' }}>
              <p className="text-xs font-medium mb-1 transition-colors" style={{ color: 'var(--text-muted)' }}>
                Plan
              </p>
              <p className="text-sm font-medium transition-colors capitalize" style={{ color: 'var(--text-primary)' }}>
                {subscription?.plan_type === 'premium' ? 'Starter' : 
                 subscription?.plan_type === 'team_starter' ? 'Team' : 
                 subscription?.plan_type ? subscription.plan_type : 'Free'}
              </p>
            </div>

            {/* Usage Meters */}
            <div className="space-y-2">
              {usage.projects !== null && (
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="transition-colors" style={{ color: 'var(--text-muted)' }}>Projects</span>
                    <span className="transition-colors" style={{ color: 'var(--text-muted)' }}>
                      {usage.projects}
                    </span>
                  </div>
                </div>
              )}
              {usage.storage !== null ? (
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="transition-colors" style={{ color: 'var(--text-muted)' }}>Storage</span>
                    <span className="transition-colors" style={{ color: 'var(--text-muted)' }}>
                      {usage.storage}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: 'var(--bg-surface)' }}>
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{ 
                        width: `${usage.storage}%`, 
                        backgroundColor: 'var(--accent)' 
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="transition-colors" style={{ color: 'var(--text-muted)' }}>Storage</span>
                    <span className="transition-colors" style={{ color: 'var(--text-muted)' }}>
                      Not available
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Upgrade Button */}
        <div className="p-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          <Link
            to="/pricing"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors bg-orange-500 hover:bg-orange-600 text-white"
          >
            {!sidebarCollapsed && (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Upgrade</span>
              </>
            )}
            {sidebarCollapsed && (
              <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            )}
          </Link>
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="hidden lg:flex items-center justify-center p-2 border-t transition-colors"
          style={{ 
            borderColor: 'var(--border-subtle)',
            color: 'var(--text-muted)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <svg 
            className={`w-5 h-5 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header 
          className="sticky top-0 z-40 border-b transition-colors" 
          style={{ 
            backgroundColor: 'var(--bg-base)', 
            borderColor: 'var(--border-subtle)' 
          }}
        >
          <div className="px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Mobile Menu Button */}
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="lg:hidden p-2 rounded-lg transition-colors mr-2"
          style={{
            color: 'var(--text-muted)',
            backgroundColor: 'transparent'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'var(--bg-surface)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
          }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Search Placeholder */}
        <div className="flex-1 max-w-xl hidden sm:block">
          <div 
            className="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors"
            style={{ 
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-muted)'
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-sm">Search...</span>
            <span className="ml-auto text-xs opacity-50 hidden md:inline">⌘K</span>
          </div>
        </div>

              {/* Right Side Actions */}
              <div className="flex items-center gap-3 ml-4">
                {/* Create Button Placeholder */}
                <button
                  onClick={() => setShowQuickAction(true)}
                  className="px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 border"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--text-primary)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'var(--bg-surface)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'var(--bg-card)';
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="hidden sm:inline">Create</span>
                </button>

                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg transition-colors"
                  style={{
                    color: 'var(--text-muted)',
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'var(--bg-surface)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                  }}
                  title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                >
                  {theme === 'light' ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  )}
                </button>

                {/* Notifications */}
                <Link
                  to="/work?view=notifications"
                  className="relative p-2 rounded-lg transition-colors"
                  style={{ backgroundColor: 'transparent' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <svg
                    className="w-5 h-5 transition-colors"
                    style={{ color: location.pathname === '/notifications' ? 'var(--text-primary)' : 'var(--text-muted)' }}
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
                    <span 
                      className="absolute top-1 right-1 w-4 h-4 text-xs font-medium rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor: 'var(--accent)',
                        color: 'var(--bg-base)'
                      }}
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
                    style={{ backgroundColor: 'var(--bg-surface)' }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'var(--bg-elevated)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'var(--bg-surface)';
                    }}
                  >
                    <span className="text-sm font-medium transition-colors" style={{ color: 'var(--text-primary)' }}>
                      {initial}
                    </span>
                  </button>

                  {showUserMenu && (
                    <div 
                      className="absolute right-0 mt-2 w-56 rounded-xl shadow-xl py-2 z-50 transition-colors border"
                      style={{
                        backgroundColor: 'var(--bg-modal)',
                        borderColor: 'var(--border-subtle)'
                      }}
                    >
                      <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                        <p className="text-sm font-medium transition-colors" style={{ color: 'var(--text-primary)' }}>
                          {user?.name}
                        </p>
                        <p className="text-xs transition-colors" style={{ color: 'var(--text-muted)' }}>
                          {user?.email}
                        </p>
                      </div>
                      
                      <div className="py-2">
                        <Link
                          to="/settings"
                          onClick={() => setShowUserMenu(false)}
                          className="block w-full text-left px-4 py-2 text-sm transition-colors"
                          style={{ color: 'var(--text-primary)' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          Settings
                        </Link>
                        <Link
                          to="/admin"
                          onClick={() => setShowUserMenu(false)}
                          className="block w-full text-left px-4 py-2 text-sm transition-colors"
                          style={{ color: 'var(--text-primary)' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          Admin
                        </Link>
                        <Link
                          to="/pricing"
                          onClick={() => setShowUserMenu(false)}
                          className="block w-full text-left px-4 py-2 text-sm transition-colors"
                          style={{ color: 'var(--text-primary)' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          Pricing & Plans
                        </Link>
                      </div>

                      <hr className="my-2" style={{ borderColor: 'var(--border-subtle)' }} />
                      
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm transition-colors"
                        style={{ color: 'var(--text-primary)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
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
            {/* Mobile Menu Header */}
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
              <Link to="/home" className="flex items-center gap-3" onClick={() => setShowMobileMenu(false)}>
                <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.6)] border border-gray-800/80">
                  <span className="font-display text-white text-lg leading-none font-semibold">W</span>
                </div>
                <span className="font-display text-lg font-semibold transition-colors" style={{ color: 'var(--text-primary)' }}>
                  WeManageAll
                </span>
              </Link>
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

            {/* Mobile Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {primaryNavItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setShowMobileMenu(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      active ? 'font-medium' : ''
                    }`}
                    style={{
                      backgroundColor: active ? 'var(--bg-surface)' : 'transparent',
                      color: active ? 'var(--text-primary)' : 'var(--text-muted)'
                    }}
                  >
                    <svg 
                      className="w-5 h-5 flex-shrink-0" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Upgrade Button */}
            <div className="p-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
              <Link
                to="/pricing"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors bg-orange-500 hover:bg-orange-600 text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Upgrade</span>
              </Link>
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
  );
}
