import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { landingCopy } from './landingCopy';

export default function LandingNavbar() {
  const { theme, toggleTheme } = useTheme();
  
  const handleNavClick = (e, href) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };
  
  return (
    <header className="fixed top-0 w-full z-50 bg-[var(--mk-bg)]/95 backdrop-blur-xl border-b mk-hairline">
      <nav className="max-w-7xl mx-auto px-6 lg:px-10 py-4 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[var(--mk-ink)] flex items-center justify-center">
            <span className="font-display text-[var(--mk-bg)] text-lg leading-none font-semibold">W</span>
          </div>
          <span className="font-semibold text-[var(--mk-ink)] hidden sm:inline">
            {landingCopy.nav.brand}
          </span>
        </Link>
        
        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {landingCopy.nav.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="text-sm font-medium text-[var(--mk-ink-2)] hover:text-[var(--mk-ink)] transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
        
        {/* Theme Toggle + CTA */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-[var(--mk-surface)] transition-colors"
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? (
              <svg className="w-5 h-5 text-[var(--mk-ink-2)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-[var(--mk-ink-2)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </button>
          
          <Link
            to="/signup"
            className="px-6 py-2.5 bg-[var(--mk-ink)] text-[var(--mk-bg)] rounded-lg hover:opacity-90 transition-opacity text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--mk-ink)] focus:ring-offset-2"
          >
            {landingCopy.hero.primaryCta}
          </Link>
        </div>
      </nav>
    </header>
  );
}
