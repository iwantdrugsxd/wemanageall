import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

// Navbar Component
function Navbar() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <header className="fixed top-0 w-full z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 px-6 lg:px-12 py-4 flex items-center justify-between transition-colors">
      <Link to="/" className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-black dark:bg-white flex items-center justify-center">
          <span className="font-display text-white dark:text-black text-sm font-semibold">O</span>
            </div>
        <span className="font-display text-lg font-semibold text-black dark:text-white transition-colors">OFA</span>
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
    <div className="p-6 space-y-4 bg-white dark:bg-gray-800">
      <div>
        <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">PERSONAL LIFE OS</div>
        <h3 className="text-lg font-display text-black dark:text-white mb-1">Good afternoon, vishnu.</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 italic">"The present moment is the only time over which we have dominion."</p>
        </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="text-xs uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-3">TODAY'S INTENTION</div>
        <p className="text-sm text-gray-800 dark:text-gray-100">
          Focus on designing a calm, high-fidelity operating system for my life.
        </p>
        </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="text-xs uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-3">DAILY OBJECTIVES</div>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white"></span>
            Review this week’s projects and pick one focus area.
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white"></span>
            Block 2 hours for deep work on the Calendar.
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white"></span>
            Log today’s expenses in Money and tag them by project.
          </li>
        </ul>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="text-xs uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-3">TIME ALLOCATION</div>
        <div className="flex items-center justify-center">
          <div className="relative w-24 h-24">
            <svg className="transform -rotate-90 w-24 h-24">
              <circle cx="48" cy="48" r="40" stroke="#e5e7eb" strokeWidth="4" fill="none" />
              {/* 65% of planned time used */}
              <circle cx="48" cy="48" r="40" stroke="#000000" strokeWidth="4" fill="none" strokeDasharray={251} strokeDashoffset={251 * 0.35} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs text-gray-600 dark:text-gray-400">65%</span>
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-gray-600 dark:text-gray-300">
          <div>
            <div className="font-medium">Deep work</div>
            <div>3h 00m</div>
                </div>
          <div>
            <div className="font-medium">Admin</div>
            <div>1h 15m</div>
              </div>
              <div>
            <div className="font-medium">Personal</div>
            <div>45m</div>
            </div>
        </div>
      </div>
    </div>
  );
}

function ProjectsPreview() {
  return (
    <div className="p-6 bg-white dark:bg-gray-800">
      <div className="mb-4">
        <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">PERSONAL LIFE OS</div>
        <h3 className="text-lg font-display text-black dark:text-white">Project Selection Hub</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">Choose a focus area for your current session.</p>
        </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center min-h-[120px]">
          <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-2">
            <span className="text-lg">+</span>
          </div>
          <p className="text-xs text-black dark:text-white font-medium">Create New Project</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Start from scratch</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700" style={{ borderLeftWidth: '4px', borderLeftColor: '#000000' }}>
          <div className="h-16 bg-black dark:bg-white flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">📚</span>
              <span className="text-xs font-medium text-white dark:text-black">Deep Work: Q1 Focus</span>
            </div>
            <span className="text-[10px] text-white/80 dark:text-black/80">Active</span>
          </div>
          <div className="p-3 space-y-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">Next step: Outline execution plan for Week 3.</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">4 tasks today · 12 open · 8 completed</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ListsPreview() {
  return (
    <div className="p-6 bg-white dark:bg-gray-800">
      <div className="mb-4">
        <h3 className="text-lg font-display text-black dark:text-white mb-1">My Lists</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">Manage your personal intentions and collections.</p>
        </div>

      <div className="flex items-center gap-2 mb-4 text-xs text-gray-500 dark:text-gray-400">
        <span className="border-b border-black dark:border-white pb-1">All Lists</span>
        <span>Recent</span>
        <span>Pinned</span>
        </div>

      <div className="space-y-3">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-black dark:text-white">Weekly Review Ritual</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Checklist for closing the week and planning the next.</p>
          </div>
          <span className="text-[11px] text-gray-500 dark:text-gray-400">12 items · Pinned</span>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-black dark:text-white">Reading Queue — 2026</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Books, articles, and papers to process.</p>
          </div>
          <span className="text-[11px] text-gray-500 dark:text-gray-400">27 items</span>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-dashed border-gray-300 dark:border-gray-700 text-center">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Need a new structure?</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Create a list for goals, errands, ideas, or anything else.</p>
        </div>
      </div>
    </div>
  );
}

function CalendarPreview() {
  return (
    <div className="p-6 bg-white dark:bg-gray-800">
      <div className="mb-4">
        <h3 className="text-lg font-display text-black dark:text-white">Calendar</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">Week view of your deep work and life blocks.</p>
        </div>

      <div className="flex gap-2 mb-4 text-xs">
        <span className="px-2 py-1 bg-black dark:bg-white text-white dark:text-black rounded">Week</span>
        <span className="px-2 py-1 text-gray-500 dark:text-gray-400">Day</span>
        <span className="px-2 py-1 text-gray-500 dark:text-gray-400">Month</span>
                </div>
      
      <div className="grid grid-cols-7 gap-1 text-xs">
        {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day, i) => (
          <div key={i} className="text-center py-2">
            <div className="text-gray-500 dark:text-gray-400 mb-1">{day}</div>
            <div className="text-gray-900 dark:text-white">{19 + i}</div>
              </div>
            ))}
      </div>
      
      <div className="mt-4 space-y-1">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 py-1 border-b border-gray-100 dark:border-gray-800">
          <span className="w-16">7:00 AM</span>
          <div className="flex-1 h-6 bg-gray-50 dark:bg-gray-900 rounded-lg px-2 flex items-center justify-between border border-gray-200 dark:border-gray-800">
            <span className="text-[11px] text-gray-700 dark:text-gray-200">Morning planning</span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400">30m</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 py-1 border-b border-gray-100 dark:border-gray-800">
          <span className="w-16">9:00 AM</span>
          <div className="flex-1 h-6 bg-black/5 dark:bg-white/5 rounded-lg px-2 flex items-center justify-between border border-gray-200 dark:border-gray-700">
            <span className="text-[11px] text-gray-800 dark:text-gray-100">Deep work — Q1 Strategy</span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400">2h</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 py-1 border-b border-gray-100 dark:border-gray-800">
          <span className="w-16">2:00 PM</span>
          <div className="flex-1 h-6 bg-gray-50 dark:bg-gray-900 rounded-lg px-2 flex items-center justify-between border border-gray-200 dark:border-gray-800">
            <span className="text-[11px] text-gray-700 dark:text-gray-200">Review Money and Lists</span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400">45m</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MoneyPreview() {
  return (
    <div className="p-6 bg-white dark:bg-gray-800">
      <div className="mb-4">
        <h3 className="text-lg font-display text-black dark:text-white mb-1">Money</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">Track your income and expenses</p>
      </div>
      
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
          <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">TOTAL INCOME</div>
          <div className="text-lg font-semibold text-green-600 dark:text-green-400">$8,450</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
          <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">TOTAL EXPENSES</div>
          <div className="text-lg font-semibold text-red-600 dark:text-red-400">$3,120</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
          <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">NET BALANCE</div>
          <div className="text-lg font-semibold text-green-600 dark:text-green-400">$5,330</div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-xs uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">INCOME</div>
          <ul className="space-y-1 text-xs text-gray-700 dark:text-gray-300">
            <li className="flex justify-between">
              <span>Client retainer — Q1</span>
              <span className="text-green-600 dark:text-green-400">+$4,000</span>
            </li>
            <li className="flex justify-between">
              <span>Freelance sprint — Design</span>
              <span className="text-green-600 dark:text-green-400">+$2,250</span>
            </li>
            <li className="flex justify-between">
              <span>Salary</span>
              <span className="text-green-600 dark:text-green-400">+$2,200</span>
            </li>
          </ul>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-xs uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">EXPENSES</div>
          <ul className="space-y-1 text-xs text-gray-700 dark:text-gray-300">
            <li className="flex justify-between">
              <span>Workspace rent</span>
              <span className="text-red-600 dark:text-red-400">- $1,200</span>
            </li>
            <li className="flex justify-between">
              <span>Tools & subscriptions</span>
              <span className="text-red-600 dark:text-red-400">- $420</span>
            </li>
            <li className="flex justify-between">
              <span>Savings transfer</span>
              <span className="text-red-600 dark:text-red-400">- $1,500</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function LibraryPreview() {
  return (
    <div className="p-6 bg-white dark:bg-gray-800">
      <div className="mb-4">
        <h3 className="text-lg font-display text-black dark:text-white mb-1">Resource Library</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">Curated intellectual assets and reading logs.</p>
      </div>
      
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-4 border-b border-black dark:border-white pb-1 inline-block">All Resources</div>
      
      <div className="space-y-3 text-xs text-gray-700 dark:text-gray-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-black dark:text-white">The Effective Executive</p>
            <p className="text-gray-500 dark:text-gray-400">Book · Notes linked to Projects: Q1 Focus</p>
          </div>
          <span className="text-gray-500 dark:text-gray-400">3 highlights</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-black dark:text-white">Energy Management, Not Time Management</p>
            <p className="text-gray-500 dark:text-gray-400">Article · Tagged: Focus, Routines</p>
          </div>
          <span className="text-gray-500 dark:text-gray-400">Read yesterday</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-black dark:text-white">Personal OS — Architecture Diagram</p>
            <p className="text-gray-500 dark:text-gray-400">PDF · Linked to Dashboard & Money</p>
          </div>
          <span className="text-gray-500 dark:text-gray-400">Pinned</span>
        </div>
      </div>
    </div>
  );
}

function EmotionsPreview() {
  return (
    <div className="p-6 bg-white dark:bg-gray-800">
      <div className="text-center mb-6">
        <h3 className="text-lg font-display text-black dark:text-white mb-2">You don't need to be <span className="italic text-[#3B6E5C]">okay</span> here.</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">This is your private space to let things out. No judgment, no audience.</p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-4">
        <textarea 
          defaultValue={"I don’t feel like I’m moving fast enough, even though I’m doing my best. I want a calmer way to track progress without feeling behind all the time."}
          className="w-full min-h-[120px] bg-transparent text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none resize-none"
          readOnly
        />
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span>Private by design</span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Nothing here is shared or analyzed</div>
        </div>
      </div>
      
      <div className="py-4 border-t border-gray-200 dark:border-gray-700 mt-2">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Recent unloads</p>
        <div className="flex flex-col gap-1 text-xs text-gray-700 dark:text-gray-300">
          <span>• Written entry — “Feeling scattered this week”</span>
          <span>• Voice note — 3m reflection after planning session</span>
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
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden transition-all duration-500">
              {/* Browser Chrome */}
              <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="flex-1 bg-white dark:bg-gray-800 rounded-md px-3 py-1.5 text-xs text-gray-500 dark:text-gray-400 ml-4 border border-gray-200 dark:border-gray-700">
                  wemanageall.in/{views[currentView].name.toLowerCase().replace(' ', '')}
                </div>
              </div>

              {/* Content Preview - Actual UI */}
              <div className="bg-gray-50 dark:bg-gray-900 min-h-[500px] max-h-[600px] overflow-y-auto">
                <CurrentPreview />
              </div>
            </div>
            
            {/* View Indicator */}
            <div className="flex justify-center gap-2 mt-6">
              {views.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentView(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentView 
                      ? 'bg-black dark:bg-white w-8' 
                      : 'bg-gray-300 dark:bg-gray-700'
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
  return (
    <section className="py-24 md:py-32 px-6 lg:px-12 bg-gray-50 dark:bg-gray-950 transition-colors" id="philosophy">
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
    <section className="py-24 md:py-32 px-6 lg:px-12 bg-white dark:bg-gray-900 transition-colors" id="system">
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
    <section className="py-24 md:py-32 px-6 lg:px-12 bg-gray-50 dark:bg-gray-950 transition-colors">
      <div className="max-w-6xl mx-auto">
        <div className="space-y-32">
          {scenes.map((scene, index) => {
            const SceneComponent = scene.component;
            return (
              <div key={index} className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="text-h3 mb-6">{scene.title}</h3>
                  <p className="text-body text-gray-600 dark:text-gray-400 mb-4">{scene.description}</p>
                  <div className="text-caption text-gray-500 dark:text-gray-500">
                    {scene.view}
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
                  <div className="bg-gray-50 dark:bg-gray-900 p-6">
                    <SceneComponent />
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
  return (
    <section className="py-24 md:py-32 px-6 lg:px-12 bg-white dark:bg-gray-900 transition-colors" id="trust">
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

// How It Works Section
function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Set your intention',
      description: 'Start each day by defining what matters. Your intention becomes the filter for everything else.',
      detail: 'Every morning, you set a clear intention. This isn\'t a to-do list—it\'s your north star for the day. All your tasks, projects, and decisions align with this single focus.',
    },
    {
      number: '02',
      title: 'Capture everything',
      description: 'Tasks, thoughts, files, expenses. Everything goes into the system. Nothing gets lost.',
      detail: 'Whether it\'s a voice note, a receipt, a project idea, or a random thought—capture it instantly. The system organizes it later. Your job is just to get it out of your head.',
    },
    {
      number: '03',
      title: 'See the connections',
      description: 'Your calendar shows your tasks. Your projects link to your files. Your expenses connect to your goals.',
      detail: 'Everything in OFA is connected. A project task appears in your calendar. An expense links to a project. Your thoughts connect to your objectives. You see the full picture.',
    },
    {
      number: '04',
      title: 'Reflect and refine',
      description: 'Weekly reviews show patterns. What worked? What didn\'t? The system learns with you.',
      detail: 'Every week, you see what actually happened versus what you planned. Patterns emerge. You adjust. The system gets smarter about how you work and live.',
    },
  ];

  return (
    <section className="py-24 md:py-32 px-6 lg:px-12 bg-gray-50 dark:bg-gray-950 transition-colors">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-h2 mb-6">
            How it works
          </h2>
          <p className="text-body text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            A simple system that grows more powerful the longer you use it.
          </p>
        </div>

        <div className="space-y-12">
            {steps.map((step, index) => (
            <div key={index} className="grid md:grid-cols-3 gap-8 items-start">
              <div className="md:col-span-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-display text-2xl font-bold">
                    {step.number}
                  </div>
                  <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800"></div>
                </div>
                <h3 className="text-h4 mb-3">{step.title}</h3>
                <p className="text-body-sm text-gray-600 dark:text-gray-400 mb-4">{step.description}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-body text-gray-700 dark:text-gray-300 leading-relaxed">{step.detail}</p>
          </div>
        </div>
          ))}
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
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-black dark:bg-white flex items-center justify-center">
              <span className="font-display text-white dark:text-black text-sm font-semibold">O</span>
            </div>
            <span className="font-display text-lg font-semibold text-black dark:text-white">OFA</span>
          </div>
          
          <div className="flex items-center gap-8 text-sm text-gray-600 dark:text-gray-400">
            <a href="#philosophy" className="hover:text-black dark:hover:text-white transition-colors">Philosophy</a>
            <a href="#system" className="hover:text-black dark:hover:text-white transition-colors">System</a>
            <a href="#trust" className="hover:text-black dark:hover:text-white transition-colors">Privacy</a>
            <Link to="/login" className="hover:text-black dark:hover:text-white transition-colors">Login</Link>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 text-center">
          <p className="text-caption text-gray-500 dark:text-gray-500">
            © 2024 OFA. All rights reserved.
          </p>
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
      <ProductStory />
      <TrustPrivacy />
      <HowItWorks />
      <UseCases />
      <Benefits />
      <FinalCTA />
      <Footer />
    </div>
  );
}
