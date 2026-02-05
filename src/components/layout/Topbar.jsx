import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLocation } from 'react-router-dom';
import { useSearch } from '../../context/SearchContext';
import IconButton from '../ui/IconButton';
import { cn } from '../../lib/cn';

export default function Topbar({ onQuickAction }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { query, setQuery, clearQuery, scope } = useSearch();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const searchInputRef = useRef(null);

  const firstName = user?.name?.split(' ')[0] || 'User';
  const initial = firstName.charAt(0).toUpperCase();

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

  // Handle ⌘K shortcut - focus search input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }
      if (e.key === 'Escape') {
        setShowUserMenu(false);
        setShowCreateMenu(false);
        if (searchInputRef.current && document.activeElement === searchInputRef.current) {
          clearQuery();
          searchInputRef.current.blur();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [clearQuery]);

  // Get route-aware placeholder
  const getPlaceholder = () => {
    if (scope === 'projects') return 'Search projects…';
    if (scope === 'library') return 'Search resources…';
    if (scope === 'lists') return 'Search lists…';
    return 'Search…';
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header 
      className="sticky top-0 z-40 border-b transition-colors" 
      style={{ 
        backgroundColor: 'var(--bg-base)', 
        borderColor: 'var(--border-subtle)' 
      }}
    >
      <div className="px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Mobile Menu Button - handled by AppShell */}
          
          {/* Search */}
          <div className="flex-1 max-w-xl hidden sm:block">
            <div 
              className="relative flex items-center gap-2 px-4 py-2 rounded-lg transition-colors border"
              style={{ 
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-subtle)'
              }}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-muted)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={getPlaceholder()}
                className="flex-1 bg-transparent border-none outline-none text-sm w-full"
                style={{ color: 'var(--text-primary)' }}
              />
              {query && (
                <button
                  onClick={clearQuery}
                  className="flex-shrink-0 p-1 rounded transition-colors hover:bg-[--bg-elevated]"
                  aria-label="Clear search"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <span className="ml-auto text-xs opacity-50 hidden md:inline" style={{ color: 'var(--text-muted)' }}>⌘K</span>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3 ml-4">
            {/* Create Button */}
            <div className="relative">
              <button
                onClick={() => setShowCreateMenu(!showCreateMenu)}
                className="px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 border"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-primary)'
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">Create</span>
              </button>

              {showCreateMenu && (
                <div 
                  className="absolute right-0 mt-2 w-56 rounded-xl shadow-xl py-2 z-50 transition-colors border"
                  style={{
                    backgroundColor: 'var(--bg-modal)',
                    borderColor: 'var(--border-subtle)'
                  }}
                >
                  <Link
                    to="/projects"
                    onClick={() => setShowCreateMenu(false)}
                    className="block w-full text-left px-4 py-2 text-sm transition-colors"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    New Project
                  </Link>
                  <Link
                    to="/home"
                    onClick={() => setShowCreateMenu(false)}
                    className="block w-full text-left px-4 py-2 text-sm transition-colors"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    New Task
                  </Link>
                  <Link
                    to="/docs?view=resources"
                    onClick={() => setShowCreateMenu(false)}
                    className="block w-full text-left px-4 py-2 text-sm transition-colors"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    New Doc
                  </Link>
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <IconButton
              onClick={toggleTheme}
              aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
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
            </IconButton>

            {/* Notifications */}
            <Link
              to="/work?view=notifications"
              className="relative p-2 rounded-lg transition-colors"
              style={{ backgroundColor: 'transparent' }}
            >
              <svg
                className="w-5 h-5 transition-colors"
                style={{ color: location.pathname.includes('notifications') ? 'var(--text-primary)' : 'var(--text-muted)' }}
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
                aria-label="User menu"
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
                    >
                      Settings
                    </Link>
                    <Link
                      to="/admin"
                      onClick={() => setShowUserMenu(false)}
                      className="block w-full text-left px-4 py-2 text-sm transition-colors"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      Admin
                    </Link>
                    <Link
                      to="/pricing"
                      onClick={() => setShowUserMenu(false)}
                      className="block w-full text-left px-4 py-2 text-sm transition-colors"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      Pricing & Plans
                    </Link>
                  </div>

                  <hr className="my-2" style={{ borderColor: 'var(--border-subtle)' }} />
                  
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm transition-colors"
                    style={{ color: 'var(--text-primary)' }}
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
  );
}
