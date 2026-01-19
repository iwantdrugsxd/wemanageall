import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

// Scroll Animation Hook
function useScrollAnimation() {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return [ref, isVisible];
}

// Navbar Component
function Navbar() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <header className="fixed top-0 w-full z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 px-6 lg:px-12 py-4 flex items-center justify-between transition-colors">
      <Link to="/" className="flex items-center">
        <div className="w-9 h-9 rounded-xl bg-black dark:bg-black flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.6)] border border-gray-800/80">
          <span className="font-display text-white text-lg leading-none font-semibold">W</span>
            </div>
          </Link>
          
      <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
        <a href="#philosophy" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">Philosophy</a>
        <a href="#system" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">System</a>
        <a href="#trust" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">Privacy</a>
      </nav>
      
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light' ? (
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          )}
        </button>
      
      <Link 
        to="/signup" 
          className="bg-black dark:bg-white text-white dark:text-black px-6 py-2.5 text-sm font-medium rounded-lg hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors"
      >
          Start Free
            </Link>
      </div>
    </header>
  );
}

// UI Preview Components
function DashboardPreview() {
  return (
    <div className="space-y-4 max-w-full">
      <div className="pb-2 border-b border-gray-100 dark:border-gray-800">
        <div className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1.5 font-semibold">PERSONAL LIFE OS</div>
        <h3 className="text-xl font-display text-black dark:text-white mb-1.5 leading-tight">Good afternoon, vishnu.</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 italic leading-relaxed">"The present moment is the only time over which we have dominion."</p>
        </div>
      
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
        <div className="text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3 font-semibold">TODAY'S INTENTION</div>
        <p className="text-sm text-gray-800 dark:text-gray-100 leading-relaxed">
          Focus on designing a calm, high-fidelity operating system for my life.
        </p>
        </div>
      
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
        <div className="text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3 font-semibold">DAILY OBJECTIVES</div>
        <ul className="space-y-2.5 text-sm text-gray-700 dark:text-gray-200">
          <li className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white mt-1.5 flex-shrink-0"></span>
            <span className="leading-relaxed">Review this week's projects and pick one focus area.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white mt-1.5 flex-shrink-0"></span>
            <span className="leading-relaxed">Block 2 hours for deep work on the Calendar.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white mt-1.5 flex-shrink-0"></span>
            <span className="leading-relaxed">Log today's expenses in Money and tag them by project.</span>
          </li>
        </ul>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
        <div className="text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-4 font-semibold">TIME ALLOCATION</div>
        <div className="flex items-center justify-center mb-4">
          <div className="relative w-28 h-28">
            <svg className="transform -rotate-90 w-28 h-28">
              <circle cx="56" cy="56" r="48" stroke="#e5e7eb" dark:stroke="#374151" strokeWidth="5" fill="none" />
              <circle cx="56" cy="56" r="48" stroke="#000000" dark:stroke="#ffffff" strokeWidth="5" fill="none" strokeDasharray={301} strokeDashoffset={301 * 0.35} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">65%</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="text-center">
            <div className="font-semibold text-gray-900 dark:text-gray-100 mb-0.5">Deep work</div>
            <div className="text-gray-600 dark:text-gray-400">3h 00m</div>
            </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900 dark:text-gray-100 mb-0.5">Admin</div>
            <div className="text-gray-600 dark:text-gray-400">1h 15m</div>
            </div>
              <div className="text-center">
            <div className="font-semibold text-gray-900 dark:text-gray-100 mb-0.5">Personal</div>
            <div className="text-gray-600 dark:text-gray-400">45m</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectsPreview() {
  return (
    <div className="space-y-6 max-w-full">
      <div>
        <div className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2 font-semibold">
          Personal life OS
        </div>
        <h3 className="text-2xl font-display text-black dark:text-white leading-tight mb-2">
          Project Selection Hub
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Choose a focus area for your current session.
        </p>
        </div>

      <div className="grid md:grid-cols-4 gap-4">
        {/* Create New Project */}
        <div className="col-span-1 bg-gray-50 dark:bg-gray-900/40 rounded-3xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center py-10 px-4 hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
          <div className="w-14 h-14 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center mb-4">
            <span className="text-2xl text-gray-700 dark:text-gray-300">+</span>
          </div>
          <p className="text-sm font-semibold text-black dark:text-white mb-1">Create New Project</p>
          <p className="text-[11px] tracking-wide uppercase text-gray-500 dark:text-gray-400">
            Start from scratch
          </p>
      </div>

        {/* Project cards */}
        <div className="col-span-3 grid sm:grid-cols-3 gap-4">
          {/* Project 1 */}
          <div className="bg-white dark:bg-gray-900/50 rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col">
            <div className="h-28 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center shadow-lg">
                <span className="text-xs text-white tracking-[0.15em] uppercase">OS</span>
              </div>
            </div>
            <div className="flex-1 px-5 pt-4 pb-5 space-y-4">
            <div>
                <p className="text-sm font-semibold text-black dark:text-white mb-1">Life OS Dev</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">Next task</p>
                <p className="text-xs text-gray-700 dark:text-gray-200">
                  Define North Star metrics
                </p>
            </div>
              <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                <span>8 tasks remaining</span>
                <span>65% complete</span>
            </div>
          </div>
        </div>

          {/* Project 2 */}
          <div className="bg-white dark:bg-gray-900/50 rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col">
            <div className="h-28 bg-gradient-to-br from-gray-900 via-gray-700 to-gray-600 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center shadow-lg">
                <span className="text-xs text-white tracking-[0.15em] uppercase">GT</span>
                </div>
              </div>
            <div className="flex-1 px-5 pt-4 pb-5 space-y-4">
              <div>
                <p className="text-sm font-semibold text-black dark:text-white mb-1">Growth Strategy</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">Next task</p>
                <p className="text-xs text-gray-700 dark:text-gray-200">
                  Analyse competitor SEO
                </p>
              </div>
              <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                <span>3 tasks remaining</span>
                <span>85% complete</span>
              </div>
            </div>
          </div>

          {/* Project 3 */}
          <div className="bg-white dark:bg-gray-900/50 rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col">
            <div className="h-28 bg-gradient-to-br from-gray-900 via-gray-700 to-gray-600 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center shadow-lg">
                <span className="text-xs text-white tracking-[0.15em] uppercase">WS</span>
              </div>
            </div>
            <div className="flex-1 px-5 pt-4 pb-5 space-y-4">
              <div>
                <p className="text-sm font-semibold text-black dark:text-white mb-1">Wellness Studio</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">Next task</p>
                <p className="text-xs text-gray-700 dark:text-gray-200">
                  Purchase gym equipment
                </p>
              </div>
              <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                <span>14 tasks remaining</span>
                <span>12% complete</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ListsPreview() {
  return (
    <div className="space-y-6 max-w-full">
      <div>
        <h3 className="text-2xl font-display text-black dark:text-white leading-tight mb-1">
          My Lists
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Manage your personal intentions and collections.
        </p>
      </div>

      {/* Tabs and toolbar */}
      <div className="flex items-center justify-between text-xs mb-3">
        <div className="flex items-center gap-4">
          <button className="pb-1.5 border-b-2 border-black dark:border-white font-semibold text-black dark:text-white">
            All Lists
          </button>
          <button className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
            Recent
          </button>
          <button className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
            Pinned
          </button>
        </div>
        <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
          <button className="w-7 h-7 rounded-lg border border-gray-200 dark:border-gray-800 flex items-center justify-center">
            <span className="text-[11px]">▤</span>
          </button>
          <button className="w-7 h-7 rounded-lg border border-gray-200 dark:border-gray-800 flex items-center justify-center">
            <span className="text-[11px]">☷</span>
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-900/40 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
          <div className="h-28 bg-gradient-to-tr from-gray-900 via-gray-800 to-gray-700 flex items-end justify-start p-4">
            <span className="px-2 py-1 text-[10px] rounded-full bg-black/60 text-white uppercase tracking-[0.16em]">
              Movies
            </span>
          </div>
          <div className="p-4 space-y-2">
            <p className="text-sm font-semibold text-black dark:text-white">Movies to Watch</p>
            <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div className="h-full w-1/3 bg-black dark:bg-white" />
            </div>
            <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
              <span>Updated 2 hours ago</span>
              <span>12 items</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900/40 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
          <div className="h-28 bg-gradient-to-tr from-gray-900 via-gray-800 to-gray-700 flex items-end justify-start p-4">
            <span className="px-2 py-1 text-[10px] rounded-full bg-black/60 text-white uppercase tracking-[0.16em]">
              Books
            </span>
          </div>
          <div className="p-4 space-y-2">
            <p className="text-sm font-semibold text-black dark:text-white">Books to Read</p>
            <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div className="h-full w-1/2 bg-black dark:bg-white" />
            </div>
            <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
              <span>Updated yesterday</span>
              <span>8 items</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mt-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/40 py-6 px-5 text-center space-y-2">
        <p className="text-sm font-semibold text-black dark:text-white">
          Start a new collection
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Organise thoughts, plans, and inspirations into beautifully structured lists.
        </p>
        <div className="mt-3 flex justify-center">
          <button className="px-4 py-2 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-medium hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors">
            Create new list
          </button>
        </div>
      </div>
    </div>
  );
}

function CalendarPreview() {
  return (
    <div className="space-y-4 max-w-full">
      <div className="pb-2 border-b border-gray-100 dark:border-gray-800">
        <h3 className="text-xl font-display text-black dark:text-white mb-1.5 leading-tight">Calendar</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">Week view of your deep work and life blocks.</p>
        </div>

      <div className="flex gap-2 mb-5 text-xs">
        <span className="px-3 py-1.5 bg-black dark:bg-white text-white dark:text-black rounded-lg font-semibold shadow-sm">Week</span>
        <span className="px-3 py-1.5 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer">Day</span>
        <span className="px-3 py-1.5 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer">Month</span>
                </div>
      
      <div className="grid grid-cols-7 gap-2 mb-5 text-xs border-b border-gray-100 dark:border-gray-800 pb-3">
        {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day, i) => (
          <div key={i} className="text-center py-2">
            <div className="text-gray-500 dark:text-gray-400 mb-1.5 font-semibold text-[10px] uppercase tracking-wider">{day}</div>
            <div className="text-gray-900 dark:text-white font-semibold">{19 + i}</div>
            </div>
          ))}
        </div>

      <div className="space-y-2.5">
        <div className="flex items-center gap-3 text-xs py-2 border-b border-gray-100 dark:border-gray-800">
          <span className="w-16 text-gray-500 dark:text-gray-400 font-medium">7:00 AM</span>
          <div className="flex-1 h-7 bg-gray-50 dark:bg-gray-900 rounded-lg px-3 flex items-center justify-between border border-gray-200 dark:border-gray-800 shadow-sm">
            <span className="text-[11px] text-gray-700 dark:text-gray-200 font-medium">Morning planning</span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400">30m</span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs py-2 border-b border-gray-100 dark:border-gray-800">
          <span className="w-16 text-gray-500 dark:text-gray-400 font-medium">9:00 AM</span>
          <div className="flex-1 h-7 bg-black/5 dark:bg-white/5 rounded-lg px-3 flex items-center justify-between border-2 border-black/10 dark:border-white/10 shadow-sm">
            <span className="text-[11px] text-gray-800 dark:text-gray-100 font-semibold">Deep work — Q1 Strategy</span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400">2h</span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs py-2 border-b border-gray-100 dark:border-gray-800">
          <span className="w-16 text-gray-500 dark:text-gray-400 font-medium">2:00 PM</span>
          <div className="flex-1 h-7 bg-gray-50 dark:bg-gray-900 rounded-lg px-3 flex items-center justify-between border border-gray-200 dark:border-gray-800 shadow-sm">
            <span className="text-[11px] text-gray-700 dark:text-gray-200 font-medium">Review Money and Lists</span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400">45m</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MoneyPreview() {
  return (
    <div className="space-y-4 max-w-full">
      <div className="pb-2 border-b border-gray-100 dark:border-gray-800">
        <h3 className="text-xl font-display text-black dark:text-white mb-1.5 leading-tight">Money</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">Track your income and expenses</p>
      </div>
      
        <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <div className="text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2 font-semibold">TOTAL INCOME</div>
          <div className="text-xl font-bold text-green-600 dark:text-green-400">$8,450</div>
          </div>
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <div className="text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2 font-semibold">TOTAL EXPENSES</div>
          <div className="text-xl font-bold text-red-600 dark:text-red-400">$3,120</div>
          </div>
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <div className="text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2 font-semibold">NET BALANCE</div>
          <div className="text-xl font-bold text-green-600 dark:text-green-400">$5,330</div>
          </div>
        </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <div className="text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3 font-semibold">INCOME</div>
          <ul className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
            <li className="flex justify-between items-center">
              <span className="leading-relaxed">Client retainer — Q1</span>
              <span className="text-green-600 dark:text-green-400 font-semibold ml-2">+$4,000</span>
            </li>
            <li className="flex justify-between items-center">
              <span className="leading-relaxed">Freelance sprint — Design</span>
              <span className="text-green-600 dark:text-green-400 font-semibold ml-2">+$2,250</span>
            </li>
            <li className="flex justify-between items-center">
              <span className="leading-relaxed">Salary</span>
              <span className="text-green-600 dark:text-green-400 font-semibold ml-2">+$2,200</span>
            </li>
          </ul>
                </div>
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <div className="text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3 font-semibold">EXPENSES</div>
          <ul className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
            <li className="flex justify-between items-center">
              <span className="leading-relaxed">Workspace rent</span>
              <span className="text-red-600 dark:text-red-400 font-semibold ml-2">- $1,200</span>
            </li>
            <li className="flex justify-between items-center">
              <span className="leading-relaxed">Tools & subscriptions</span>
              <span className="text-red-600 dark:text-red-400 font-semibold ml-2">- $420</span>
            </li>
            <li className="flex justify-between items-center">
              <span className="leading-relaxed">Savings transfer</span>
              <span className="text-red-600 dark:text-red-400 font-semibold ml-2">- $1,500</span>
            </li>
          </ul>
              </div>
          </div>
        </div>
  );
}

function LibraryPreview() {
  return (
    <div className="space-y-6 max-w-full">
      <div>
        <h3 className="text-2xl font-display text-black dark:text-white leading-tight mb-1">
          Resource Library
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Curated intellectual assets and reading logs.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 pb-2">
        <button className="pb-1.5 border-b-2 border-black dark:border-white font-semibold text-black dark:text-white">
          All Resources
        </button>
        <button className="hover:text-black dark:hover:text-white transition-colors">
          Programming
        </button>
        <button className="hover:text-black dark:hover:text-white transition-colors">
          Design
        </button>
        <button className="hover:text-black dark:hover:text-white transition-colors">
          Growth
        </button>
        <button className="hover:text-black dark:hover:text-white transition-colors">
          Philosophy
        </button>
      </div>

      {/* Programming section */}
      <div className="space-y-3">
        <h4 className="text-sm font-display text-black dark:text-white">Programming</h4>
        <div className="grid sm:grid-cols-3 gap-4">
          {/* Card 1 */}
          <div className="bg-white dark:bg-gray-900/40 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm flex flex-col">
            <div className="h-32 bg-gray-800 flex items-center justify-center">
              <span className="text-xs uppercase tracking-[0.15em] text-gray-200">
                Clean Code
              </span>
            </div>
            <div className="flex-1 p-4 space-y-2">
              <p className="text-sm font-semibold text-black dark:text-white">
                Clean Code: A Handbook of Agile Software…
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Robert C. Martin
              </p>
              <div className="mt-2">
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-1">Progress</p>
                <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <div className="h-full w-1/3 bg-black dark:bg-white" />
                </div>
              </div>
              <button className="mt-2 inline-flex items-center justify-center px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 text-[11px] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800">
                Resume reading
              </button>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white dark:bg-gray-900/40 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm flex flex-col">
            <div className="h-32 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <span className="text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-300">
                React Patterns
              </span>
            </div>
            <div className="flex-1 p-4 space-y-2">
              <p className="text-sm font-semibold text-black dark:text-white">
                React Design Patterns &amp; Best Practices
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">Lars Grammel</p>
              <div className="mt-2">
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-1">Progress</p>
                <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <div className="h-full w-1/6 bg-black dark:bg-white" />
                </div>
              </div>
              <button className="mt-2 inline-flex items-center justify-center px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 text-[11px] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800">
                Resume reading
              </button>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white dark:bg-gray-900/40 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm flex flex-col">
            <div className="h-32 bg-gray-800 flex items-center justify-center">
              <span className="text-xs uppercase tracking-[0.15em] text-gray-200">
                Pragmatic
              </span>
            </div>
            <div className="flex-1 p-4 space-y-2">
              <p className="text-sm font-semibold text-black dark:text-white">
                The Pragmatic Programmer: Your Journey…
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">Andrew Hunt</p>
              <div className="mt-2">
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-1">Progress</p>
                <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <div className="h-full w-4/5 bg-black dark:bg-white" />
                </div>
              </div>
              <button className="mt-2 inline-flex items-center justify-center px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 text-[11px] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800">
                Resume reading
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Design section */}
      <div className="space-y-3">
        <h4 className="text-sm font-display text-black dark:text-white">Design</h4>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-900/40 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm flex flex-col">
            <div className="h-32 bg-gray-800 flex items-center justify-center">
              <span className="text-xs uppercase tracking-[0.15em] text-gray-200">
                Grid Systems
              </span>
            </div>
            <div className="flex-1 p-4 space-y-2">
              <p className="text-sm font-semibold text-black dark:text-white">
                Grid Systems in Graphic Design
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Josef Müller-Brockmann
              </p>
              <div className="mt-2">
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-1">Progress</p>
                <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <div className="h-full w-[5%] bg-black dark:bg-white" />
                </div>
              </div>
              <button className="mt-2 inline-flex items-center justify-center px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 text-[11px] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800">
                Resume reading
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmotionsPreview() {
  return (
    <div className="space-y-4 max-w-full">
      <div className="text-center pb-2 border-b border-gray-100 dark:border-gray-800">
        <h3 className="text-xl font-display text-black dark:text-white mb-2 leading-tight">You don't need to be <span className="italic text-[#3B6E5C] dark:text-[#4ade80]">okay</span> here.</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">This is your private space to let things out. No judgment, no audience.</p>
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl border-2 border-gray-200 dark:border-gray-800 p-5">
        <textarea 
          defaultValue={"I don't feel like I'm moving fast enough, even though I'm doing my best. I want a calmer way to track progress without feeling behind all the time."}
          className="w-full min-h-[120px] bg-transparent text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none resize-none leading-relaxed"
          readOnly
        />
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Private by design</span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Nothing here is shared or analyzed</div>
        </div>
      </div>
      
      <div className="py-4 border-t border-gray-100 dark:border-gray-800">
        <p className="text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3 font-semibold">Recent unloads</p>
        <div className="flex flex-col gap-2 text-xs text-gray-700 dark:text-gray-300">
          <div className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 mt-1.5 flex-shrink-0"></span>
            <span className="leading-relaxed">Written entry — "Feeling scattered this week"</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 mt-1.5 flex-shrink-0"></span>
            <span className="leading-relaxed">Voice note — 3m reflection after planning session</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hero Section
function Hero() {
  const [currentView, setCurrentView] = useState(0);
  const views = [
    { name: 'Dashboard', caption: 'Everything you manage, finally in one place.', component: DashboardPreview },
    { name: 'Projects', caption: 'Every meaningful outcome starts as a project.', component: ProjectsPreview },
    { name: 'Lists', caption: 'Structure your thoughts into action.', component: ListsPreview },
    { name: 'Calendar', caption: 'Your time and your tasks finally live together.', component: CalendarPreview },
    { name: 'Money', caption: 'Know where your money goes. Quietly.', component: MoneyPreview },
    { name: 'Library', caption: 'Your second brain, built into your workflow.', component: LibraryPreview },
    { name: 'Thinking Space', caption: 'You don\'t need to be okay here.', component: EmotionsPreview },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentView((prev) => (prev + 1) % views.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const CurrentPreview = views[currentView].component;

  return (
    <section className="min-h-screen flex items-center px-6 lg:px-12 pt-24 pb-20 bg-white dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Editorial Text */}
          <div>
            <h1 className="text-h1 mb-6">
              Your personal life operating system.
          </h1>
            <p className="text-body-lg text-gray-600 dark:text-gray-400 mb-6 max-w-xl">
              OFA brings your projects, lists, calendar, files, finances, thoughts, and knowledge into one quiet, intelligent workspace.
        </p>
            <p className="text-body-sm text-gray-500 dark:text-gray-500 mb-12">
              Designed for people who take their life seriously.
        </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Link 
            to="/signup" 
                className="px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors text-sm font-medium text-center"
          >
                Start Free
            </Link>
          <a 
                href="#system" 
                className="px-8 py-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-black dark:text-white rounded-lg hover:border-black dark:hover:border-white transition-colors text-sm font-medium text-center"
          >
                View Live Demo
            </a>
          </div>
            
            <p className="text-caption text-gray-500 dark:text-gray-500">
              Private by design · No credit card · Takes 2 minutes
            </p>
        </div>

          {/* Right: UI Preview */}
          <div className="relative">
            {/* Subtle glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded-3xl opacity-20 blur-xl"></div>
            
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 shadow-[0_25px_80px_-15px_rgba(0,0,0,0.15)] dark:shadow-[0_25px_80px_-15px_rgba(0,0,0,0.4)] overflow-hidden transition-all duration-500">
              {/* Browser Chrome - More realistic */}
              <div className="bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 border-b border-gray-200 dark:border-gray-700 px-5 py-3.5 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400 shadow-sm"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-sm"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400 shadow-sm"></div>
                </div>
                <div className="flex-1 bg-white dark:bg-gray-800 rounded-md px-4 py-2 text-xs text-gray-600 dark:text-gray-400 ml-4 border border-gray-200 dark:border-gray-700 shadow-sm font-medium flex items-center gap-2">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  wemanageall.in/{views[currentView].name.toLowerCase().replace(' ', '')}
                </div>
                <div className="flex items-center gap-1.5 ml-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </div>
              </div>

              {/* Content Preview - Actual UI with proper padding and containment */}
              <div className="bg-white dark:bg-gray-800 p-8 min-h-[600px] max-h-[700px] overflow-y-auto">
                <div className="transition-opacity duration-500 max-w-full h-full">
                  <CurrentPreview />
                </div>
              </div>
            </div>
            
            {/* Caption */}
            <p className="text-center mt-8 text-body-sm text-gray-600 dark:text-gray-400 italic">
              {views[currentView].caption}
            </p>
            
            {/* View Indicator */}
            <div className="flex justify-center gap-2 mt-4">
              {views.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentView(index)}
                  className={`h-1.5 rounded-full transition-all ${
                    index === currentView 
                      ? 'bg-black dark:bg-white w-8' 
                      : 'bg-gray-300 dark:bg-gray-700 w-1.5'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Philosophy Section
function Philosophy() {
  const [ref, isVisible] = useScrollAnimation();

  return (
    <section 
      ref={ref}
      className={`py-24 md:py-32 px-6 lg:px-12 bg-gray-50 dark:bg-gray-950 transition-all duration-700 ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
      }`}
      id="philosophy"
    >
      <div className="max-w-4xl mx-auto">
        <h2 className="text-h2 mb-8 text-center">
          Life is complex.<br />
          Your tools shouldn't be.
        </h2>
        <div className="space-y-6 text-body text-gray-700 dark:text-gray-300 leading-relaxed">
          <p>
            Most apps solve one tiny problem.
            Tasks here. Notes there. Files somewhere else. Money in a spreadsheet.
            Your thoughts nowhere.
          </p>
          <p>
            OFA exists to replace your entire personal operating stack with one coherent system.
          </p>
        </div>
      </div>
    </section>
  );
}

// System Overview Section
function SystemOverview() {
  const [ref, isVisible] = useScrollAnimation();
  
  const modules = [
    {
      title: 'Dashboard',
      description: 'Your real-time command center for life.',
    },
    {
      title: 'Projects',
      description: 'Plan and execute meaningful work from idea to completion.',
    },
    {
      title: 'Lists',
      description: 'Capture everything. Structure later. Forget nothing.',
    },
    {
      title: 'Calendar',
      description: 'See your time, tasks, and priorities in one unified timeline.',
    },
    {
      title: 'Upload',
      description: 'Store files exactly where they belong.',
    },
    {
      title: 'Money',
      description: 'Track income, expenses, and financial clarity effortlessly.',
    },
    {
      title: 'Library',
      description: 'Your personal knowledge base for ideas, notes, and learning.',
    },
    {
      title: 'Thinking Space',
      description: 'A private place to process your thoughts. No judgment. No audience.',
    },
  ];

  return (
    <section 
      ref={ref}
      className={`py-24 md:py-32 px-6 lg:px-12 bg-white dark:bg-gray-900 transition-all duration-700 ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
      }`}
      id="system"
    >
      <div className="max-w-6xl mx-auto">
        <h2 className="text-h2 mb-16 text-center">
          One system. Seven core spaces.
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {modules.map((module, index) => (
            <div 
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all"
            >
              <h3 className="text-h5 mb-3">{module.title}</h3>
              <p className="text-body-sm text-gray-600 dark:text-gray-400">{module.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Scroll-Driven Product Story
function ProductStory() {
  const [ref, isVisible] = useScrollAnimation();
  
  const scenes = [
    {
      title: 'Start your day with clarity, not chaos.',
      view: 'Dashboard',
      description: 'Today\'s intention, daily objectives, time allocation, and schedule in one view.',
      component: DashboardPreview,
    },
    {
      title: 'Every meaningful outcome starts as a project.',
      view: 'Projects',
      description: 'From idea to completion. Structure your work, track progress, see everything.',
      component: ProjectsPreview,
    },
    {
      title: 'Structure your thoughts into action.',
      view: 'Lists',
      description: 'Capture everything. Organize later. Never lose an idea or task.',
      component: ListsPreview,
    },
    {
      title: 'Your time and your tasks finally live together.',
      view: 'Calendar',
      description: 'See your schedule, tasks, and priorities in one unified timeline.',
      component: CalendarPreview,
    },
    {
      title: 'Know where your money goes. Quietly.',
      view: 'Money',
      description: 'Track income, expenses, and financial clarity without the noise.',
      component: MoneyPreview,
    },
    {
      title: 'Your second brain, built into your workflow.',
      view: 'Library',
      description: 'Resources, reading logs, notes, and knowledge all in one place.',
      component: LibraryPreview,
    },
    {
      title: 'You don\'t need to be okay here.',
      view: 'Thinking Space',
      description: 'A private place to process your thoughts. No judgment. No audience.',
      component: EmotionsPreview,
    },
  ];

  return (
    <section 
      ref={ref}
      className={`py-24 md:py-32 px-6 lg:px-12 bg-gray-50 dark:bg-gray-950 transition-all duration-700 ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="max-w-6xl mx-auto">
        <div className="space-y-32">
          {scenes.map((scene, index) => {
            const SceneComponent = scene.component;
            const [sceneRef, sceneVisible] = useScrollAnimation();
            return (
              <div 
                key={index} 
                ref={sceneRef}
                className={`grid md:grid-cols-2 gap-12 items-center transition-all duration-700 delay-${index * 100} ${
                  sceneVisible 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-8'
                }`}
              >
                <div>
                  <h3 className="text-h3 mb-6">{scene.title}</h3>
                  <p className="text-body text-gray-600 dark:text-gray-400 mb-4">{scene.description}</p>
                  <div className="text-caption text-gray-500 dark:text-gray-500">
                    {scene.view}
        </div>
            </div>
                <div className="relative">
                  {/* Subtle glow effect */}
                  <div className="absolute -inset-0.5 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded-2xl opacity-10 blur-lg"></div>
                  
                  <div className="relative bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden">
                    {/* Browser Chrome - More realistic */}
                    <div className="bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400 shadow-sm"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-sm"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-green-400 shadow-sm"></div>
                      </div>
                      <div className="flex-1 bg-white dark:bg-gray-800 rounded px-3 py-1 text-[10px] text-gray-500 dark:text-gray-400 ml-3 border border-gray-200 dark:border-gray-700 flex items-center gap-1.5">
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        wemanageall.in
                      </div>
                    </div>
                    {/* Preview Content - Properly contained and filled */}
                    <div className="bg-white dark:bg-gray-800 p-6 min-h-[500px] max-h-[600px] overflow-y-auto">
                      <div className="max-w-full h-full">
                        <SceneComponent />
                      </div>
                    </div>
                  </div>
        </div>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Trust & Privacy Section
function TrustPrivacy() {
  const [ref, isVisible] = useScrollAnimation();
  
  return (
    <section 
      ref={ref}
      className={`py-24 md:py-32 px-6 lg:px-12 bg-white dark:bg-gray-900 transition-all duration-700 ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
      }`}
      id="trust"
    >
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-h2 mb-8">
          Private by design.
          </h2>
        <div className="space-y-6 text-body text-gray-700 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto">
          <p>
            Nothing here is shared.
            Nothing is analyzed.
            Nothing is sold.
          </p>
          <p>
            OFA is your space. Period.
          </p>
        </div>
        </div>
    </section>
  );
}

// How It Works Section - Redesigned with actual UI previews
function HowItWorks() {
  const flows = [
    {
      module: 'Dashboard',
      outcome: 'Start each day with clarity, not chaos.',
      benefit: 'Your intention, objectives, and time allocation in one view. No switching between apps.',
      component: DashboardPreview,
    },
    {
      module: 'Projects',
      outcome: 'Every meaningful outcome starts as a project.',
      benefit: 'Break down complex work into actionable steps. See progress at a glance. Link tasks to deadlines.',
      component: ProjectsPreview,
    },
    {
      module: 'Lists',
      outcome: 'Capture everything. Structure later.',
      benefit: 'Quick capture for ideas, errands, goals. Organize when you\'re ready. Nothing gets forgotten.',
      component: ListsPreview,
    },
    {
      module: 'Calendar',
      outcome: 'Your time and your tasks finally live together.',
      benefit: 'Tasks appear in your calendar. Time blocks protect deep work. See your week at a glance.',
      component: CalendarPreview,
    },
    {
      module: 'Upload',
      outcome: 'Every file. Exactly where it belongs.',
      benefit: 'Store documents, receipts, resources. Link them to projects. Find them instantly.',
      component: null, // We'll create a simple upload preview
    },
    {
      module: 'Money',
      outcome: 'Know where your money goes. Quietly.',
      benefit: 'Track income and expenses in one place. Link expenses to projects. See patterns over time.',
      component: MoneyPreview,
    },
    {
      module: 'Library',
      outcome: 'Your second brain, built into your workflow.',
      benefit: 'Store articles, books, notes. Link to projects. Build knowledge over time.',
      component: LibraryPreview,
    },
    {
      module: 'Thinking Space',
      outcome: 'You don\'t need to be okay here.',
      benefit: 'Private space for thoughts, emotions, reflections. No judgment. No audience. Just clarity.',
      component: EmotionsPreview,
    },
  ];

  // Simple Upload Preview Component
  function UploadPreview() {
  return (
      <div className="space-y-4 max-w-full">
        <div className="pb-2 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-xl font-display text-black dark:text-white mb-1.5 leading-tight">Upload</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">Store files exactly where they belong.</p>
      </div>
      
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 border-2 border-dashed border-gray-300 dark:border-gray-700 text-center">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">Drop files here or click to upload</p>
          <p className="text-xs text-gray-500 dark:text-gray-500">PDF, images, documents</p>
        </div>

        <div className="space-y-2">
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 border border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-xs">PDF</span>
                    </div>
              <div>
                <p className="text-xs font-medium text-black dark:text-white">Q1_Strategy_Doc.pdf</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Linked to: Deep Work project</p>
                    </div>
                  </div>
            <span className="text-[10px] text-gray-500 dark:text-gray-400">2.4 MB</span>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 border border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-xs">IMG</span>
              </div>
              <div>
                <p className="text-xs font-medium text-black dark:text-white">Receipt_March_15.jpg</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Linked to: Money</p>
              </div>
            </div>
            <span className="text-[10px] text-gray-500 dark:text-gray-400">156 KB</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="py-24 md:py-32 px-6 lg:px-12 bg-gray-50 dark:bg-gray-950 transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-h2 mb-6">
            How it works
          </h2>
          <p className="text-body text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Eight core spaces. One system. Everything connected.
          </p>
        </div>

        <div className="space-y-24">
          {flows.map((flow, index) => {
            const [ref, isVisible] = useScrollAnimation();
            const PreviewComponent = flow.component || UploadPreview;
            const isEven = index % 2 === 0;
            
            return (
              <div 
                key={index} 
                ref={ref}
                className={`grid md:grid-cols-2 gap-16 items-center transition-all duration-700 ${
                  isVisible 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-8'
                }`}
              >
                {/* Text Content */}
                <div className={isEven ? '' : 'md:order-2'}>
                    <div className="mb-4">
                    <span className="text-label text-gray-500 dark:text-gray-400">{flow.module}</span>
                    </div>
                  <h3 className="text-h3 mb-6 leading-tight">
                    {flow.outcome}
                  </h3>
                  <p className="text-body-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                    {flow.benefit}
                  </p>
                </div>

                {/* UI Preview */}
                <div className={isEven ? '' : 'md:order-1'}>
                  <div className="relative">
                    {/* Subtle glow effect */}
                    <div className="absolute -inset-0.5 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded-2xl opacity-10 blur-lg"></div>
                    
                    <div className="relative bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden">
                      {/* Browser Chrome */}
                      <div className="bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center gap-2">
                        <div className="flex gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-400 shadow-sm"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-sm"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-green-400 shadow-sm"></div>
                      </div>
                        <div className="flex-1 bg-white dark:bg-gray-800 rounded px-3 py-1 text-[10px] text-gray-500 dark:text-gray-400 ml-3 border border-gray-200 dark:border-gray-700 flex items-center gap-1.5">
                          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          wemanageall.in/{flow.module.toLowerCase()}
                  </div>
                </div>
                      {/* Preview Content - Filled */}
                      <div className="bg-white dark:bg-gray-800 p-6 min-h-[500px] max-h-[600px] overflow-y-auto">
                        <div className="max-w-full h-full">
                          <PreviewComponent />
              </div>
          </div>
        </div>
          </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Use Cases Section
function UseCases() {
  const useCases = [
    {
      title: 'The Individual Operator',
      scenario: 'You manage multiple projects, track expenses, and need clarity on daily priorities.',
      solution: 'Dashboard shows your intention and objectives. Projects organize your work. Money tracks your finances. Everything connects.',
      features: ['Daily intention setting', 'Project progress tracking', 'Expense categorization', 'Time allocation insights'],
    },
    {
      title: 'The Student / Builder',
      scenario: 'You juggle coursework, personal projects, deadlines, and learning resources.',
      solution: 'Projects break down complex work. Calendar shows deadlines. Library stores your learning. Lists capture ideas instantly.',
      features: ['Project-based organization', 'Deadline management', 'Resource library', 'Quick capture lists'],
    },
    {
      title: 'The Founder',
      scenario: 'You need to execute on vision, manage finances, maintain focus, and process decisions.',
      solution: 'Projects structure execution. Money tracks cash flow. Thinking Space processes decisions. Calendar protects deep work.',
      features: ['Strategic project planning', 'Financial clarity', 'Decision processing', 'Time blocking'],
    },
    {
      title: 'The Reflective Mind',
      scenario: 'You value introspection, emotional processing, and understanding your patterns.',
      solution: 'Thinking Space provides a private outlet. Dashboard shows patterns. Calendar reveals time use. Everything supports self-awareness.',
      features: ['Private thought processing', 'Pattern recognition', 'Emotional tracking', 'Reflection tools'],
    },
  ];

  return (
    <section className="py-24 md:py-32 px-6 lg:px-12 bg-white dark:bg-gray-900 transition-colors">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-h2 mb-6">
            Built for people who think long-term
          </h2>
          <p className="text-body text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Different roles, one system. OFA adapts to how you actually work and live.
          </p>
                </div>
        
        <div className="space-y-8">
          {useCases.map((useCase, index) => (
            <div 
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all"
            >
              <h3 className="text-h4 mb-4">{useCase.title}</h3>
              <div className="grid md:grid-cols-2 gap-8 mb-6">
                <div>
                  <p className="text-label text-gray-500 dark:text-gray-400 mb-2">The Challenge</p>
                  <p className="text-body text-gray-700 dark:text-gray-300">{useCase.scenario}</p>
                </div>
                <div>
                  <p className="text-label text-gray-500 dark:text-gray-400 mb-2">How OFA Helps</p>
                  <p className="text-body text-gray-700 dark:text-gray-300">{useCase.solution}</p>
                  </div>
                </div>
              <div>
                <p className="text-label text-gray-500 dark:text-gray-400 mb-3">Key Features</p>
                <div className="flex flex-wrap gap-2">
                  {useCase.features.map((feature, fIndex) => (
                    <span 
                      key={fIndex}
                      className="px-3 py-1 bg-gray-50 dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      {feature}
                    </span>
            ))}
          </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Benefits Section
function Benefits() {
  const benefits = [
    {
      title: 'One system, not ten apps',
      description: 'Stop switching between task managers, note apps, calendars, and spreadsheets. Everything lives in one place.',
      metric: 'Save 2+ hours weekly',
    },
    {
      title: 'Everything connects',
      description: 'Your calendar shows your tasks. Your expenses link to projects. Your thoughts connect to objectives. See the full picture.',
      metric: '100% context preserved',
    },
    {
      title: 'Private by default',
      description: 'Your data stays yours. No tracking, no analysis, no sharing. Just your system, working for you.',
      metric: 'Zero data sharing',
    },
    {
      title: 'Gets smarter over time',
      description: 'The longer you use OFA, the better it understands your patterns. Weekly reviews reveal insights you didn\'t see.',
      metric: 'Pattern recognition',
    },
  ];

  return (
    <section className="py-24 md:py-32 px-6 lg:px-12 bg-gray-50 dark:bg-gray-950 transition-colors">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-h2 mb-6">
            Why this works
          </h2>
          </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-h5">{benefit.title}</h3>
                <span className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 px-2 py-1 bg-gray-50 dark:bg-gray-900 rounded">
                  {benefit.metric}
                </span>
              </div>
              <p className="text-body-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {benefit.description}
              </p>
          </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Social Proof Section
function SocialProof() {
  return (
    <section className="py-24 md:py-32 px-6 lg:px-12 bg-white dark:bg-gray-900 transition-colors">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <div className="text-3xl font-display text-black dark:text-white mb-2">2,400+</div>
            <div className="text-body-sm text-gray-600 dark:text-gray-400">Active users</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-display text-black dark:text-white mb-2">47,000+</div>
            <div className="text-body-sm text-gray-600 dark:text-gray-400">Tasks completed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-display text-black dark:text-white mb-2">12,000+</div>
            <div className="text-body-sm text-gray-600 dark:text-gray-400">Hours tracked</div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-body text-gray-700 dark:text-gray-300 mb-4 italic">
              "Finally, a system that respects how I actually work. Not another productivity app—a real operating system for life."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">S</span>
              </div>
              <div>
                <div className="text-sm font-medium text-black dark:text-white">Sarah Chen</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Product Designer</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-body text-gray-700 dark:text-gray-300 mb-4 italic">
              "The connection between projects, calendar, and money is what makes this different. Everything finally makes sense together."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">M</span>
              </div>
              <div>
                <div className="text-sm font-medium text-black dark:text-white">Marcus Johnson</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Software Engineer</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Final CTA Section
function FinalCTA() {
  return (
    <section className="py-24 md:py-32 px-6 lg:px-12 bg-white dark:bg-gray-900 transition-colors">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <h2 className="text-h2 mb-6">
            Build the system your future self will thank you for
          </h2>
          <p className="text-body text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
            Start free. No credit card required. Set up takes 2 minutes. Your data stays private.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link 
            to="/signup" 
              className="px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors text-sm font-medium"
          >
              Start Free
            </Link>
          <a 
              href="#system" 
              className="px-8 py-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-black dark:text-white rounded-lg hover:border-black dark:hover:border-white transition-colors text-sm font-medium"
          >
              View Demo
          </a>
        </div>
          
          <div className="flex items-center justify-center gap-6 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Private by default</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>2-minute setup</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span>No credit card</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Footer
function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-16 px-6 lg:px-12 transition-colors">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center mb-4">
              <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.6)] border border-gray-800/80">
                <span className="font-display text-white text-lg leading-none font-semibold">W</span>
            </div>
          </div>
            <p className="text-body-sm text-gray-600 dark:text-gray-400">
              Your personal life operating system.
          </p>
        </div>
          
          {/* Product */}
        <div>
            <h4 className="text-label text-gray-900 dark:text-white mb-4">Product</h4>
            <ul className="space-y-3">
              <li><a href="#system" className="text-body-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">Features</a></li>
              <li><Link to="/pricing" className="text-body-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">Pricing</Link></li>
              <li><a href="#philosophy" className="text-body-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">Philosophy</a></li>
          </ul>
        </div>
          
          {/* Company */}
        <div>
            <h4 className="text-label text-gray-900 dark:text-white mb-4">Company</h4>
            <ul className="space-y-3">
              <li><a href="#trust" className="text-body-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">Privacy</a></li>
              <li><a href="#" className="text-body-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">Terms</a></li>
              <li><a href="#" className="text-body-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">Contact</a></li>
          </ul>
        </div>
          
          {/* Account */}
        <div>
            <h4 className="text-label text-gray-900 dark:text-white mb-4">Account</h4>
            <ul className="space-y-3">
              <li><Link to="/login" className="text-body-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">Login</Link></li>
              <li><Link to="/signup" className="text-body-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">Sign Up</Link></li>
          </ul>
        </div>
      </div>
        
        <div className="pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-caption text-gray-500 dark:text-gray-500">
            © 2024 OFA. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-gray-500 dark:text-gray-500">
            <span>Private by design</span>
            <span>•</span>
            <span>No tracking</span>
            <span>•</span>
            <span>Your data</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Main Landing Page Component
export default function Landing() {
  return (
    <div className="overflow-x-hidden bg-white dark:bg-gray-900 transition-colors">
      <Navbar />
      <Hero />
      <Philosophy />
      <SystemOverview />
      <TrustPrivacy />
      <HowItWorks />
      <UseCases />
      <Benefits />
      <SocialProof />
      <FinalCTA />
      <Footer />
    </div>
  );
}
