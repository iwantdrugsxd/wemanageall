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

// Hero Section
function Hero() {
  const [currentView, setCurrentView] = useState(0);
  const views = [
    { name: 'Dashboard', caption: 'Everything you manage, finally in one place.' },
    { name: 'Projects', caption: 'Every meaningful outcome starts as a project.' },
    { name: 'Lists', caption: 'Structure your thoughts into action.' },
    { name: 'Calendar', caption: 'Your time and your tasks finally live together.' },
    { name: 'Upload', caption: 'Every file. Exactly where it belongs.' },
    { name: 'Money', caption: 'Know where your money goes. Quietly.' },
    { name: 'Library', caption: 'Your second brain, built into your workflow.' },
    { name: 'Thinking Space', caption: 'You don\'t need to be okay here.' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentView((prev) => (prev + 1) % views.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

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

              {/* Content Preview */}
              <div className="bg-white dark:bg-gray-800 p-8 min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-700 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl">📊</span>
                  </div>
                  <h3 className="text-h4 mb-2">{views[currentView].name}</h3>
                  <p className="text-body-sm text-gray-500 dark:text-gray-400">{views[currentView].caption}</p>
                </div>
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
    },
    {
      title: 'Every meaningful outcome starts as a project.',
      view: 'Projects',
      description: 'From idea to completion. Structure your work, track progress, see everything.',
    },
    {
      title: 'Structure your thoughts into action.',
      view: 'Lists',
      description: 'Capture everything. Organize later. Never lose an idea or task.',
    },
    {
      title: 'Your time and your tasks finally live together.',
      view: 'Calendar',
      description: 'See your schedule, tasks, and priorities in one unified timeline.',
    },
    {
      title: 'Every file. Exactly where it belongs.',
      view: 'Upload',
      description: 'Store documents, images, and resources linked to your projects and lists.',
    },
    {
      title: 'Know where your money goes. Quietly.',
      view: 'Money',
      description: 'Track income, expenses, and financial clarity without the noise.',
    },
    {
      title: 'Your second brain, built into your workflow.',
      view: 'Library',
      description: 'Resources, reading logs, notes, and knowledge all in one place.',
    },
    {
      title: 'You don\'t need to be okay here.',
      view: 'Thinking Space',
      description: 'A private place to process your thoughts. No judgment. No audience.',
    },
  ];

  return (
    <section className="py-24 md:py-32 px-6 lg:px-12 bg-gray-50 dark:bg-gray-950 transition-colors">
      <div className="max-w-6xl mx-auto">
        <div className="space-y-32">
          {scenes.map((scene, index) => (
            <div key={index} className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-h3 mb-6">{scene.title}</h3>
                <p className="text-body text-gray-600 dark:text-gray-400 mb-4">{scene.description}</p>
                <div className="text-caption text-gray-500 dark:text-gray-500">
                  {scene.view}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 min-h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-xl">📊</span>
                  </div>
                  <p className="text-body-sm text-gray-500 dark:text-gray-400">{scene.view}</p>
                </div>
              </div>
            </div>
          ))}
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

// Who This Is For Section
function WhoThisIsFor() {
  const personas = [
    {
      title: 'The Individual Operator',
      description: 'Clarity, habits, goals, structure',
    },
    {
      title: 'The Student / Builder',
      description: 'Projects, deadlines, learning, ideas',
    },
    {
      title: 'The Founder',
      description: 'Execution, finance, focus, thinking',
    },
    {
      title: 'The Reflective Mind',
      description: 'Thoughts, emotions, journaling',
    },
  ];

  return (
    <section className="py-24 md:py-32 px-6 lg:px-12 bg-gray-50 dark:bg-gray-950 transition-colors">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-h2 mb-16 text-center">
          Built for people who think long-term.
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {personas.map((persona, index) => (
            <div 
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-h5 mb-3">{persona.title}</h3>
              <p className="text-body-sm text-gray-600 dark:text-gray-400">{persona.description}</p>
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
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-h2 mb-12">
          Build the system your future self will thank you for.
        </h2>
        
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
        
        <p className="text-caption text-gray-500 dark:text-gray-500">
          No credit card · Private by default · Takes 2 minutes
        </p>
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
      <WhoThisIsFor />
      <FinalCTA />
      <Footer />
    </div>
  );
}
