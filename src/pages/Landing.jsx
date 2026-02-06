import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { motion, useScroll, useTransform, useMotionValueEvent, useReducedMotion, AnimatePresence } from 'framer-motion';

// Preview Shell Component
function PreviewShell({ title, children, large = false }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden ${large ? 'shadow-xl' : ''}`}>
      {/* Browser Chrome */}
      <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-3 py-2 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
            </div>
        <div className="flex-1 bg-white dark:bg-gray-800 rounded px-2 py-1 text-[10px] text-gray-500 dark:text-gray-400 ml-2 border border-gray-200 dark:border-gray-700">
          wemanageall.in/{title.toLowerCase().replace(/\s+/g, '')}
      </div>
      </div>
      {/* Content */}
      <div className={`bg-white dark:bg-gray-800 ${large ? 'p-6' : 'p-4'}`}>
        {children}
      </div>
    </div>
  );
}

// Dashboard Preview (Today)
function DashboardPreview() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-black dark:text-white mb-1">Today</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">Good morning, there • Dec 19, 2024 • 9:42 AM</p>
        </div>
      
      {/* KPI Strip */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[
          { label: 'Objectives', value: '3/5' },
          { label: 'Planned', value: '4h' },
          { label: 'Spent', value: '2h' },
          { label: 'Upcoming', value: '2' }
        ].map((kpi, i) => (
          <div key={i} className="bg-gray-50 dark:bg-gray-900/50 rounded-md p-2 border border-gray-200 dark:border-gray-800">
            <div className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">{kpi.label}</div>
            <div className="text-sm font-semibold text-black dark:text-white">{kpi.value}</div>
          </div>
        ))}
        </div>
      
      {/* Today's Intention */}
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 border border-gray-200 dark:border-gray-800">
        <div className="text-[10px] uppercase text-gray-500 dark:text-gray-400 mb-2 font-semibold">Today's Intention</div>
        <p className="text-xs text-gray-700 dark:text-gray-200">Focus on shipping the new feature</p>
      </div>

      {/* Daily Objectives */}
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 border border-gray-200 dark:border-gray-800">
        <div className="text-[10px] uppercase text-gray-500 dark:text-gray-400 mb-2 font-semibold">Daily Objectives</div>
        <div className="space-y-1.5">
          {['Review PR feedback', 'Update documentation', 'Team standup'].map((task, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-200">
              <div className="w-3 h-3 rounded border border-gray-300 dark:border-gray-600"></div>
              <span>{task}</span>
            </div>
          ))}
          </div>
        </div>

      {/* Schedule Widget */}
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 border border-gray-200 dark:border-gray-800">
        <div className="text-[10px] uppercase text-gray-500 dark:text-gray-400 mb-2 font-semibold">Agenda</div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
            <span className="text-gray-700 dark:text-gray-200">10:00 AM - Team standup</span>
            </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
            <span className="text-gray-700 dark:text-gray-200">2:00 PM - Deep work session</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Projects Preview
function ProjectsPreview() {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-black dark:text-white mb-1">Projects</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">Your project portfolio</p>
        </div>

      {/* Table Header */}
      <div className="grid grid-cols-6 gap-2 text-[10px] uppercase text-gray-500 dark:text-gray-400 font-semibold mb-2 pb-2 border-b border-gray-200 dark:border-gray-700">
        <div>Name</div>
        <div>Status</div>
        <div>Progress</div>
        <div>Start</div>
        <div>Tags</div>
        <div></div>
      </div>

      {/* Project Rows */}
      <div className="space-y-1.5">
        {[
          { name: 'Q1 Launch', status: 'In Progress', progress: '65%', start: 'Jan 1', tags: 'Product' },
          { name: 'Website Redesign', status: 'Planning', progress: '20%', start: 'Jan 15', tags: 'Design' },
          { name: 'Mobile App', status: 'In Progress', progress: '45%', start: 'Dec 1', tags: 'Engineering' }
        ].map((project, i) => (
          <div key={i} className="grid grid-cols-6 gap-2 items-center py-1.5 hover:bg-gray-50 dark:hover:bg-gray-900/50 rounded text-xs">
            <div className="font-medium text-black dark:text-white">{project.name}</div>
            <div className="text-gray-600 dark:text-gray-400">{project.status}</div>
            <div className="text-gray-600 dark:text-gray-400">{project.progress}</div>
            <div className="text-gray-600 dark:text-gray-400">{project.start}</div>
            <div className="text-gray-600 dark:text-gray-400">{project.tags}</div>
            <div className="text-right">⋯</div>
              </div>
        ))}
      </div>
    </div>
  );
}

// Project Workspace Preview (Board View)
function ProjectWorkspacePreview() {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-black dark:text-white mb-1">Q1 Launch</h3>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span className="font-semibold text-black dark:text-white">Board</span>
          <span>•</span>
          <span>List</span>
          <span>•</span>
          <span>Timeline</span>
          <span>•</span>
          <span>Notes</span>
        </div>
      </div>

      {/* Board Columns */}
      <div className="grid grid-cols-3 gap-3">
        {['To Do', 'In Progress', 'Done'].map((col, i) => (
          <div key={i} className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2 border border-gray-200 dark:border-gray-800">
            <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">{col}</div>
            <div className="space-y-2">
              {i === 0 && (
                <>
                  <div className="bg-white dark:bg-gray-800 rounded p-2 text-xs border border-gray-200 dark:border-gray-700">
                    <div className="font-medium text-black dark:text-white mb-1">Design mockups</div>
                    <div className="text-gray-500 dark:text-gray-400 text-[10px]">Due: Jan 20</div>
          </div>
                  <div className="bg-white dark:bg-gray-800 rounded p-2 text-xs border border-gray-200 dark:border-gray-700">
                    <div className="font-medium text-black dark:text-white mb-1">User research</div>
                    <div className="text-gray-500 dark:text-gray-400 text-[10px]">Due: Jan 22</div>
            </div>
                </>
              )}
              {i === 1 && (
                <div className="bg-white dark:bg-gray-800 rounded p-2 text-xs border border-gray-200 dark:border-gray-700">
                  <div className="font-medium text-black dark:text-white mb-1">API integration</div>
                  <div className="text-gray-500 dark:text-gray-400 text-[10px]">Due: Jan 18</div>
            </div>
              )}
              {i === 2 && (
                <div className="bg-white dark:bg-gray-800 rounded p-2 text-xs border border-gray-200 dark:border-gray-700 opacity-60">
                  <div className="font-medium text-black dark:text-white mb-1">Project setup</div>
                  <div className="text-gray-500 dark:text-gray-400 text-[10px]">Completed</div>
          </div>
              )}
        </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Calendar Preview (Week View)
function CalendarPreview() {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-black dark:text-white mb-1">Calendar</h3>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span className="px-2 py-0.5 bg-black dark:bg-white text-white dark:text-black rounded font-semibold">Week</span>
          <span>Day</span>
          <span>Month</span>
        </div>
                </div>
      
      {/* Week Grid */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
          <div key={i} className="text-center">
            <div className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">{day}</div>
            <div className="text-xs font-semibold text-black dark:text-white">{19 + i}</div>
            </div>
          ))}
        </div>

      {/* Time Slots */}
      <div className="space-y-1.5">
        {[
          { time: '9:00 AM', event: 'Team standup', color: 'bg-blue-100 dark:bg-blue-900' },
          { time: '2:00 PM', event: 'Deep work', color: 'bg-green-100 dark:bg-green-900' },
          { time: '4:00 PM', event: 'Client call', color: 'bg-purple-100 dark:bg-purple-900' }
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <div className="w-12 text-gray-500 dark:text-gray-400 text-[10px]">{item.time}</div>
            <div className={`flex-1 rounded px-2 py-1 ${item.color} text-gray-700 dark:text-gray-200`}>
              {item.event}
          </div>
        </div>
        ))}
      </div>
    </div>
  );
}

// Resources Preview
function ResourcesPreview() {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-black dark:text-white mb-1">Resources</h3>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span className="border-b-2 border-black dark:border-white font-semibold text-black dark:text-white">All</span>
          <span>Programming</span>
          <span>Design</span>
          </div>
        </div>

      {/* Resource Cards */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { title: 'Clean Code', author: 'Robert C. Martin', progress: '33%' },
          { title: 'React Patterns', author: 'Lars Grammel', progress: '15%' }
        ].map((resource, i) => (
          <div key={i} className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2 border border-gray-200 dark:border-gray-800">
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded mb-2 flex items-center justify-center">
              <span className="text-[10px] text-gray-500 dark:text-gray-400">PDF</span>
                </div>
            <div className="text-xs font-semibold text-black dark:text-white mb-1">{resource.title}</div>
            <div className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">{resource.author}</div>
            <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
              <div className="h-full bg-black dark:bg-white" style={{ width: resource.progress }}></div>
              </div>
          </div>
        ))}
          </div>
        </div>
  );
}

// Lists Preview
function ListsPreview() {
  return (
      <div className="space-y-3">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-black dark:text-white mb-1">Lists</h3>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span className="border-b-2 border-black dark:border-white font-semibold text-black dark:text-white">All Lists</span>
          <span>Recent</span>
          <span>Pinned</span>
            </div>
          </div>

      {/* List Cards */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { name: 'Movies to Watch', items: '12 items', progress: '33%' },
          { name: 'Books to Read', items: '8 items', progress: '50%' }
        ].map((list, i) => (
          <div key={i} className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2 border border-gray-200 dark:border-gray-800">
            <div className="h-12 bg-gradient-to-br from-gray-800 to-gray-600 rounded mb-2"></div>
            <div className="text-xs font-semibold text-black dark:text-white mb-1">{list.name}</div>
            <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400">
              <span>{list.items}</span>
              <span>{list.progress}</span>
            </div>
                </div>
        ))}
      </div>
    </div>
  );
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
        <a href="#features" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">Features</a>
        <a href="#pricing" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">Pricing</a>
      </nav>
      
      <div className="flex items-center gap-4">
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
          Start free
        </Link>
          </div>
    </header>
  );
}

// Hero Section (Kinetic/Cinematic)
function Hero() {
  const shouldReduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 150]);
  const y2 = useTransform(scrollY, [0, 500], [0, 100]);
  const y3 = useTransform(scrollY, [0, 500], [0, 50]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  
  return (
    <section className="relative min-h-screen flex items-center px-6 lg:px-12 pt-24 pb-20 bg-white dark:bg-gray-900 overflow-hidden">
      {/* Animated Background Layers */}
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: shouldReduceMotion ? 0.1 : 0.15 }}
      >
        <motion.div 
          className="absolute top-20 right-20 w-96 h-96 bg-blue-500/20 dark:bg-blue-400/10 rounded-full blur-3xl"
          animate={shouldReduceMotion ? {} : {
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
            y: [0, 20, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/20 dark:bg-purple-400/10 rounded-full blur-3xl"
          animate={shouldReduceMotion ? {} : {
            scale: [1, 1.3, 1],
            x: [0, -20, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Editorial Text */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 30 }}
            animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-semibold text-black dark:text-white mb-6 leading-tight">
              Run your startup from one living system.
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-xl leading-relaxed">
              WeManageAll unifies projects, execution, calendar, and knowledge into one calm operating system.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Link 
                to="/signup" 
                className="px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors text-sm font-medium text-center"
              >
                Start free
              </Link>
              <a 
                href="#features" 
                className="px-8 py-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-black dark:text-white rounded-lg hover:border-black dark:hover:border-white transition-colors text-sm font-medium text-center"
              >
                Book a demo
              </a>
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-500">
              No credit card required.
            </p>
          </motion.div>

          {/* Right: Floating Stack of Product Windows */}
          <div className="hidden lg:block relative h-[600px]">
            <motion.div
              style={{ 
                y: shouldReduceMotion ? 0 : y1,
                opacity: shouldReduceMotion ? 1 : opacity 
              }}
              className="absolute top-0 right-0 w-full max-w-md"
            >
              <PreviewShell title="Dashboard" large>
                <DashboardPreview />
              </PreviewShell>
            </motion.div>
            
            <motion.div
              style={{ 
                y: shouldReduceMotion ? 0 : y2,
                opacity: shouldReduceMotion ? 1 : opacity 
              }}
              className="absolute top-20 right-10 w-full max-w-md -z-10 blur-sm"
            >
              <PreviewShell title="Projects">
                <ProjectsPreview />
              </PreviewShell>
            </motion.div>
            
            <motion.div
              style={{ 
                y: shouldReduceMotion ? 0 : y3,
                opacity: shouldReduceMotion ? 1 : opacity 
              }}
              className="absolute top-40 right-20 w-full max-w-md -z-20 blur-md opacity-50"
            >
              <PreviewShell title="Calendar">
                <CalendarPreview />
              </PreviewShell>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Product is Alive Band (Animated Stats + Marquee)
function ProductAliveBand() {
  const shouldReduceMotion = useReducedMotion();
  const [counters, setCounters] = useState({ teams: 0, tasks: 0, hours: 0 });
  
  useEffect(() => {
    if (shouldReduceMotion) {
      setCounters({ teams: 2000, tasks: 45000, hours: 12000 });
      return;
    }
    
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    
    const teamsTarget = 2000;
    const tasksTarget = 45000;
    const hoursTarget = 12000;
    
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      setCounters({
        teams: Math.floor(teamsTarget * easeOut),
        tasks: Math.floor(tasksTarget * easeOut),
        hours: Math.floor(hoursTarget * easeOut),
      });
      
      if (step >= steps) clearInterval(timer);
    }, interval);
    
    return () => clearInterval(timer);
  }, [shouldReduceMotion]);
  
  const keywords = ['Projects', 'Calendar', 'Work', 'Docs', 'Resources', 'Lists', 'Execution', 'Knowledge'];
  
  return (
    <section className="py-16 px-6 lg:px-12 bg-black dark:bg-gray-950 text-white border-y border-gray-800">
      <div className="max-w-7xl mx-auto">
        {/* Animated Counters */}
        <div className="grid grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <motion.div 
              className="text-4xl md:text-5xl font-display font-semibold mb-2"
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
              whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              {counters.teams.toLocaleString()}+
            </motion.div>
            <div className="text-sm text-gray-400">Teams</div>
          </div>
          <div className="text-center">
            <motion.div 
              className="text-4xl md:text-5xl font-display font-semibold mb-2"
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
              whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {counters.tasks.toLocaleString()}
            </motion.div>
            <div className="text-sm text-gray-400">Tasks completed</div>
          </div>
          <div className="text-center">
            <motion.div 
              className="text-4xl md:text-5xl font-display font-semibold mb-2"
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
              whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {counters.hours.toLocaleString()}
            </motion.div>
            <div className="text-sm text-gray-400">Hours tracked</div>
          </div>
        </div>
        
        {/* Marquee */}
        <div className="overflow-hidden">
          <motion.div
            className="flex gap-12"
            animate={shouldReduceMotion ? {} : {
              x: [0, -50 * keywords.length * 2],
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 30,
                ease: "linear",
              },
            }}
          >
            {[...keywords, ...keywords, ...keywords].map((keyword, i) => (
              <div key={i} className="text-2xl md:text-3xl font-display font-light text-gray-400 whitespace-nowrap">
                {keyword}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Sticky Scrollytelling Product Tour
function ScrollytellingTour() {
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });
  
  const [activeStep, setActiveStep] = useState(0);
  
  const steps = [
    {
      title: "Capture the day",
      description: "Set your intention and daily objectives. Everything connects to your projects and calendar.",
      preview: <DashboardPreview />
    },
    {
      title: "Ship projects",
      description: "Board, timeline, and ownership. Break down work into actionable steps.",
      preview: <ProjectWorkspacePreview />
    },
    {
      title: "Protect time",
      description: "Calendar with deep-work blocks. Tasks appear where you need them.",
      preview: <CalendarPreview />
    },
    {
      title: "Build knowledge",
      description: "Resources and lists. Your second brain, built into your workflow.",
      preview: <ResourcesPreview />
    },
    {
      title: "Stay aligned",
      description: "Everything linked together. One system, one source of truth.",
      preview: <ListsPreview />
    }
  ];
  
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (shouldReduceMotion) return;
    const stepIndex = Math.min(
      Math.floor(latest * steps.length),
      steps.length - 1
    );
    setActiveStep(stepIndex);
  });
  
  return (
    <section 
      ref={containerRef}
      className="relative py-32 px-6 lg:px-12 bg-white dark:bg-gray-900"
      id="features"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Left: Text Steps */}
          <div className="space-y-32">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className={`min-h-[400px] transition-opacity duration-500 ${
                  activeStep === index ? 'opacity-100' : 'opacity-30'
                }`}
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 30 }}
                whileInView={shouldReduceMotion ? {} : { opacity: activeStep === index ? 1 : 0.3, y: 0 }}
                viewport={{ once: false, amount: 0.5 }}
                transition={{ duration: 0.6 }}
              >
                <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4 font-semibold">
                  Step {index + 1}
                </div>
                <h3 className="text-4xl md:text-5xl font-display font-semibold text-black dark:text-white mb-6 leading-tight">
                  {step.title}
                </h3>
                <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
          
          {/* Right: Sticky Preview */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.95 }}
                  animate={shouldReduceMotion ? {} : { opacity: 1, scale: 1 }}
                  exit={shouldReduceMotion ? {} : { opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                >
                  <PreviewShell title={steps[activeStep].title} large>
                    {steps[activeStep].preview}
                  </PreviewShell>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Projects + Workspace Section
function ProjectsWorkspaceSection() {
  const [ref1, isVisible1] = useScrollAnimation();
  const [ref2, isVisible2] = useScrollAnimation();

  return (
    <section className="py-24 md:py-32 px-6 lg:px-12 bg-white dark:bg-gray-900 transition-colors border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto">
        {/* Projects Section */}
        <div 
          ref={ref1}
          className={`grid md:grid-cols-2 gap-12 items-center mb-24 transition-all duration-700 ${
            isVisible1 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-8'
                }`}
              >
          {/* Preview */}
                <div>
            <PreviewShell title="Projects">
              <ProjectsPreview />
            </PreviewShell>
        </div>

          {/* Copy */}
          <div>
            <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4 font-semibold">
              PROJECTS
                      </div>
            <h3 className="text-3xl md:text-4xl font-display font-semibold text-black dark:text-white mb-4 leading-tight">
              Every meaningful outcome starts as a project.
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              Break down complex work into actionable steps. See progress at a glance.
            </p>
                      </div>
                    </div>

        {/* Workspace Section */}
        <div 
          ref={ref2}
          className={`grid md:grid-cols-2 gap-12 items-center transition-all duration-700 ${
            isVisible2 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Copy */}
          <div className="md:order-2">
            <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4 font-semibold">
              PROJECT WORKSPACE
                      </div>
            <h3 className="text-3xl md:text-4xl font-display font-semibold text-black dark:text-white mb-4 leading-tight">
              Board, list, timeline, and notes in one view.
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              Visualize tasks, track progress, and collaborate seamlessly.
            </p>
                    </div>

          {/* Preview */}
          <div className="md:order-1">
            <PreviewShell title="Workspace">
              <ProjectWorkspacePreview />
            </PreviewShell>
                  </div>
        </div>
      </div>
    </section>
  );
}

// Core Modules Grid
function CoreModulesGrid() {
  const shouldReduceMotion = useReducedMotion();
  const modules = [
    {
      name: 'Projects',
      description: 'Break down work into actionable steps',
      icon: '📋',
      preview: <ProjectsPreview />
    },
    {
      name: 'Work',
      description: 'Board, list, and timeline views',
      icon: '⚡',
      preview: <ProjectWorkspacePreview />
    },
    {
      name: 'Calendar',
      description: 'Time and tasks in one place',
      icon: '📅',
      preview: <CalendarPreview />
    },
    {
      name: 'Resources',
      description: 'Your second brain',
      icon: '📚',
      preview: <ResourcesPreview />
    },
    {
      name: 'Lists',
      description: 'Capture everything, structure later',
      icon: '📝',
      preview: <ListsPreview />
    },
    {
      name: 'Docs',
      description: 'Knowledge that connects',
      icon: '📄',
      preview: <div className="p-4 text-xs text-gray-500 dark:text-gray-400">Documentation preview</div>
    }
  ];
  
  return (
    <section className="py-32 px-6 lg:px-12 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto">
        <motion.h2 
          className="text-4xl md:text-5xl font-display font-semibold text-black dark:text-white mb-16 text-center"
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 30 }}
          whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Everything your team needs, in one place.
        </motion.h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module, index) => (
            <motion.div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/20 hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 30 }}
              whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
            >
              <div className="text-3xl mb-4">{module.icon}</div>
              <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
                {module.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {module.description}
              </p>
              <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <PreviewShell title={module.name}>
                  {module.preview}
                </PreviewShell>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Calendar + Resources Section
function CalendarResourcesSection() {
  const [ref1, isVisible1] = useScrollAnimation();
  const [ref2, isVisible2] = useScrollAnimation();
  
  return (
    <section className="py-24 md:py-32 px-6 lg:px-12 bg-gray-50 dark:bg-gray-950 transition-colors border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto">
        {/* Calendar Section */}
        <div 
          ref={ref1}
          className={`grid md:grid-cols-2 gap-12 items-center mb-24 transition-all duration-700 ${
            isVisible1 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
      }`}
        >
          {/* Preview */}
          <div>
            <PreviewShell title="Calendar">
              <CalendarPreview />
            </PreviewShell>
        </div>

          {/* Copy */}
              <div>
            <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4 font-semibold">
              CALENDAR
                    </div>
            <h3 className="text-3xl md:text-4xl font-display font-semibold text-black dark:text-white mb-4 leading-tight">
              Your time and your tasks finally live together.
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              Tasks appear in your calendar. Time blocks protect deep work.
            </p>
                  </div>
          </div>

        {/* Resources Section */}
        <div 
          ref={ref2}
          className={`grid md:grid-cols-2 gap-12 items-center transition-all duration-700 ${
            isVisible2 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-8'
                }`}
              >
          {/* Copy */}
          <div className="md:order-2">
            <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4 font-semibold">
              RESOURCES
                    </div>
            <h3 className="text-3xl md:text-4xl font-display font-semibold text-black dark:text-white mb-4 leading-tight">
              Your second brain, built into your workflow.
                  </h3>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              Store articles, books, notes. Link to projects. Build knowledge over time.
                  </p>
                </div>

          {/* Preview */}
          <div className="md:order-1">
            <PreviewShell title="Resources">
              <ResourcesPreview />
            </PreviewShell>
                      </div>
        </div>
      </div>
    </section>
  );
}

// Enterprise Proof Section
function EnterpriseProof() {
  const shouldReduceMotion = useReducedMotion();
  const features = [
    'Role-based access',
    'Audit-ready workflows',
    'Privacy by design',
    'Scales with teams and founders'
  ];
  
  return (
    <section className="py-32 px-6 lg:px-12 bg-black dark:bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto">
        <motion.h2 
          className="text-4xl md:text-5xl font-display font-semibold mb-12 text-center"
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 30 }}
          whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Enterprise-ready by default.
        </motion.h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="text-center"
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
              whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="text-2xl mb-3">✓</div>
              <div className="text-lg text-gray-300">{feature}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Pricing CTA Section
function PricingCTA() {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <section className="py-32 px-6 lg:px-12 bg-white dark:bg-gray-900">
      <div className="max-w-4xl mx-auto text-center">
        <motion.h2 
          className="text-4xl md:text-5xl font-display font-semibold text-black dark:text-white mb-6"
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 30 }}
          whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Simple plans that scale with your team.
        </motion.h2>
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Link 
            to="/pricing" 
            className="inline-block px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors text-sm font-medium"
          >
            View pricing
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// Lists Section
function ListsSection() {
  const [ref, isVisible] = useScrollAnimation();

  return (
    <section className="py-24 md:py-32 px-6 lg:px-12 bg-white dark:bg-gray-900 transition-colors border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto">
        <div 
          ref={ref}
          className={`grid md:grid-cols-2 gap-12 items-center transition-all duration-700 ${
            isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Preview */}
                <div>
            <PreviewShell title="Lists">
              <ListsPreview />
            </PreviewShell>
                </div>

          {/* Copy */}
              <div>
            <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4 font-semibold">
              LISTS
              </div>
            <h3 className="text-3xl md:text-4xl font-display font-semibold text-black dark:text-white mb-4 leading-tight">
              Capture everything. Structure later.
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              Quick capture for ideas, errands, goals. Organize when you're ready.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// Final CTA Section
function FinalCTA() {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <section className="py-32 px-6 lg:px-12 bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-4xl mx-auto text-center">
        <motion.h2 
          className="text-4xl md:text-5xl font-display font-semibold text-black dark:text-white mb-6"
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 30 }}
          whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Start building your startup OS today.
        </motion.h2>
        <motion.p 
          className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto"
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Start free. No credit card required. Set up takes 2 minutes.
        </motion.p>
        
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Link 
            to="/signup" 
            className="px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors text-sm font-medium"
          >
            Start free
          </Link>
          <a 
            href="#features" 
            className="px-8 py-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-black dark:text-white rounded-lg hover:border-black dark:hover:border-white transition-colors text-sm font-medium"
          >
            Book a demo
          </a>
        </motion.div>
      </div>
    </section>
  );
}

// Footer
function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-16 px-6 lg:px-12 transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center mb-4">
              <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.6)] border border-gray-800/80">
                <span className="font-display text-white text-lg leading-none font-semibold">W</span>
            </div>
          </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your startup operating system.
          </p>
        </div>
          
          {/* Product */}
        <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Product</h4>
            <ul className="space-y-3">
              <li><Link to="/home" className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/projects" className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">Projects</Link></li>
              <li><Link to="/work" className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">Work</Link></li>
              <li><Link to="/docs" className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">Docs</Link></li>
              <li><Link to="/work?view=calendar" className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">Calendar</Link></li>
          </ul>
        </div>
          
          {/* Company */}
        <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Company</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">Privacy</a></li>
              <li><a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">Terms</a></li>
          </ul>
        </div>
          
          {/* Contact */}
        <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Contact</h4>
            <ul className="space-y-3">
              <li><a href="mailto:hello@wemanageall.in" className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">hello@wemanageall.in</a></li>
          </ul>
        </div>
      </div>
        
        <div className="pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-500 text-center">
            © 2024 WeManageAll. All rights reserved.
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
      <ProductAliveBand />
      <ScrollytellingTour />
      <CoreModulesGrid />
      <EnterpriseProof />
      <PricingCTA />
      <FinalCTA />
      <Footer />
    </div>
  );
}
