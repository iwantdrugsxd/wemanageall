import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PRIMARY_NAV, SECONDARY_NAV } from '../../config/navigation';
import { cn } from '../../lib/cn';

export default function Sidebar({ collapsed, onToggleCollapse }) {
  const location = useLocation();
  const { user } = useAuth();
  const [showMore, setShowMore] = useState(false);

  // Save collapsed state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', collapsed.toString());
  }, [collapsed]);

  const isActive = (path) => {
    if (path === '/home') {
      return location.pathname === '/home' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const workspaceLabel = user?.current_organization_id ? 'Team Workspace' : 'Personal';

  return (
    <aside 
      className={cn(
        'hidden lg:flex flex-col border-r transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
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
          {!collapsed && (
            <span className="font-display text-lg font-semibold transition-colors" style={{ color: 'var(--text-primary)' }}>
              WeManageAll
            </span>
          )}
        </Link>
      </div>

      {/* Workspace Switcher */}
      {!collapsed && (
        <div className="p-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="px-3 py-2 rounded-lg transition-colors" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <p className="text-xs font-medium mb-1 transition-colors" style={{ color: 'var(--text-muted)' }}>
              Workspace
            </p>
            <p className="text-sm transition-colors" style={{ color: 'var(--text-primary)' }}>
              {workspaceLabel}
            </p>
          </div>
        </div>
      )}

      {/* Primary Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {PRIMARY_NAV.map((item) => {
          const active = isActive(item.to);
          return (
            <Link
              key={item.key}
              to={item.to}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                active && 'font-medium'
              )}
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
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}

        {/* Secondary Navigation (More) */}
        {!collapsed && (
          <>
            <div className="pt-4 mt-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
              <button
                onClick={() => setShowMore(!showMore)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium"
                style={{ color: 'var(--text-muted)' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
                <span>More</span>
                <svg 
                  className={cn('w-4 h-4 ml-auto transition-transform', showMore && 'rotate-180')}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            {showMore && (
              <div className="space-y-1">
                {SECONDARY_NAV.map((item) => {
                  const active = isActive(item.to);
                  return (
                    <Link
                      key={item.key}
                      to={item.to}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm',
                        active && 'font-medium'
                      )}
                      style={{
                        backgroundColor: active ? 'var(--bg-surface)' : 'transparent',
                        color: active ? 'var(--text-primary)' : 'var(--text-muted)'
                      }}
                    >
                      <svg 
                        className="w-4 h-4 flex-shrink-0" 
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
              </div>
            )}
          </>
        )}
      </nav>

      {/* Upgrade Button */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
        <Link
          to="/pricing"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors bg-orange-500 hover:bg-orange-600 text-white"
        >
          {!collapsed && (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Upgrade</span>
            </>
          )}
          {collapsed && (
            <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          )}
        </Link>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => onToggleCollapse(!collapsed)}
        className="hidden lg:flex items-center justify-center p-2 border-t transition-colors"
        style={{ 
          borderColor: 'var(--border-subtle)',
          color: 'var(--text-muted)'
        }}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <svg 
          className={cn('w-5 h-5 transition-transform', collapsed && 'rotate-180')}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
      </button>
    </aside>
  );
}
