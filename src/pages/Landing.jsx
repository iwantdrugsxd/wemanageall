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

// Preview Shell Component
function PreviewShell({ title, children }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      {/* Browser Chrome */}
      <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-3 py-2 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
        </div>
        <div className="flex-1 bg-white dark:bg-gray-800 rounded px-2 py-1 text-[10px] text-gray-500 dark:text-gray-400 ml-2 border border-gray-200 dark:border-gray-700">
          wemanageall.in/{title.toLowerCase().replace(' ', '')}
        </div>
      </div>
      {/* Content */}
      <div className="p-4 bg-white dark:bg-gray-800">
        {children}
      </div>
    </div>
  );
}

// Dashboard Preview (Today)
function DashboardPreview() {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-black dark:text-white mb-1">Today</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">Good morning, there • Dec 19, 2024 • 9:42 AM</p>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {['3/5', '4h', '2h', '2'].map((val, i) => (
          <div key={i} className="bg-gray-50 dark:bg-gray-900/50 rounded-md p-2 border border-gray-200 dark:border-gray-800">
            <div className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">Objectives</div>
            <div className="text-sm font-semibold text-black dark:text-white">{val}</div>
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
          <span>Board</span>
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
          <span className="px-2 py-0.5 bg-black dark:bg-white text-white dark:text-black rounded">Week</span>
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
          <span className="border-b-2 border-black dark:border-white">All</span>
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
          <span className="border-b-2 border-black dark:border-white">All Lists</span>
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

// Hero Section
function Hero() {
  return (
    <section className="min-h-screen flex items-center px-6 lg:px-12 pt-24 pb-20 bg-white dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Editorial Text */}
          <div>
            <h1 className="text-5xl md:text-6xl font-semibold text-black dark:text-white mb-6 leading-tight">
              Run your startup from one operating system.
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-xl">
              WeManageAll unifies projects, docs, resources, calendar, and execution in one calm workspace.
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
          </div>

          {/* Right: Product Preview Strip */}
          <div className="grid grid-cols-2 gap-4">
            <PreviewShell title="Dashboard">
              <DashboardPreview />
            </PreviewShell>
            <PreviewShell title="Projects">
              <ProjectsPreview />
            </PreviewShell>
            <PreviewShell title="Workspace">
              <ProjectWorkspacePreview />
            </PreviewShell>
            <PreviewShell title="Calendar">
              <CalendarPreview />
            </PreviewShell>
            <PreviewShell title="Resources">
              <ResourcesPreview />
            </PreviewShell>
            <PreviewShell title="Lists">
              <ListsPreview />
            </PreviewShell>
          </div>
        </div>
      </div>
    </section>
  );
}

// Feature Pillars Section
function FeaturePillars() {
  const [ref, isVisible] = useScrollAnimation();
  
  const pillars = [
    {
      title: 'Execution clarity',
      description: 'Daily objectives connect directly to projects and schedules.'
    },
    {
      title: 'Unified knowledge',
      description: 'Docs, resources, and lists live in one connected system.'
    },
    {
      title: 'Enterprise control',
      description: 'Security, permissions, and audit-ready workflows.'
    }
  ];

  return (
    <section 
      ref={ref}
      className={`py-24 md:py-32 px-6 lg:px-12 bg-gray-50 dark:bg-gray-950 transition-all duration-700 ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
      }`}
      id="features"
    >
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-semibold text-black dark:text-white mb-12 text-center">
          Everything your team needs, in one place.
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {pillars.map((pillar, index) => (
            <div 
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-xl font-semibold text-black dark:text-white mb-3">
                {pillar.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Deep Dive Sections
function DeepDive() {
  const modules = [
    {
      title: 'Dashboard',
      subtitle: 'Start your day with clarity, not chaos.',
      description: 'Today\'s intention, daily objectives, time allocation, and schedule in one view.',
      component: DashboardPreview
    },
    {
      title: 'Projects',
      subtitle: 'Every meaningful outcome starts as a project.',
      description: 'Break down complex work into actionable steps. See progress at a glance.',
      component: ProjectsPreview
    },
    {
      title: 'Project Workspace',
      subtitle: 'Board, list, timeline, and notes in one view.',
      description: 'Visualize tasks, track progress, and collaborate seamlessly.',
      component: ProjectWorkspacePreview
    },
    {
      title: 'Calendar',
      subtitle: 'Your time and your tasks finally live together.',
      description: 'Tasks appear in your calendar. Time blocks protect deep work.',
      component: CalendarPreview
    },
    {
      title: 'Resources',
      subtitle: 'Your second brain, built into your workflow.',
      description: 'Store articles, books, notes. Link to projects. Build knowledge over time.',
      component: ResourcesPreview
    },
    {
      title: 'Lists',
      subtitle: 'Capture everything. Structure later.',
      description: 'Quick capture for ideas, errands, goals. Organize when you\'re ready.',
      component: ListsPreview
    }
  ];

  return (
    <section className="py-24 md:py-32 px-6 lg:px-12 bg-white dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-24">
          {modules.map((module, index) => {
            const [ref, isVisible] = useScrollAnimation();
            const PreviewComponent = module.component;
            const isEven = index % 2 === 0;
            
            return (
              <div 
                key={index} 
                ref={ref}
                className={`grid md:grid-cols-2 gap-12 items-center transition-all duration-700 ${
                  isVisible 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-8'
                }`}
              >
                {/* Text Content */}
                <div className={isEven ? '' : 'md:order-2'}>
                  <h3 className="text-3xl md:text-4xl font-semibold text-black dark:text-white mb-4 leading-tight">
                    {module.subtitle}
                  </h3>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                    {module.description}
                  </p>
                  <div className="text-sm text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                    {module.title}
                  </div>
                </div>

                {/* UI Preview */}
                <div className={isEven ? '' : 'md:order-1'}>
                  <PreviewShell title={module.title}>
                    <PreviewComponent />
                  </PreviewShell>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Final CTA Section
function FinalCTA() {
  return (
    <section className="py-24 md:py-32 px-6 lg:px-12 bg-gray-50 dark:bg-gray-950 transition-colors">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-semibold text-black dark:text-white mb-6">
          Ready to unify your workflow?
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
          Start free. No credit card required. Set up takes 2 minutes.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
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
        
        <div className="pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500 dark:text-gray-500">
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
      <FeaturePillars />
      <DeepDive />
      <FinalCTA />
      <Footer />
    </div>
  );
}
