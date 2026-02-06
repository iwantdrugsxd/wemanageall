import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { motion, useScroll, useTransform, useMotionValueEvent, useReducedMotion, AnimatePresence } from 'framer-motion';

// ScreenImage Component - Switches light/dark based on theme
function ScreenImage({ name, alt, className = '', priority = false }) {
  const { theme } = useTheme();
  const imagePath = `/landing/screens/${name}-${theme}.png`;
  
  return (
    <picture>
      <source srcSet={`/landing/screens/${name}-dark.png`} media="(prefers-color-scheme: dark)" />
      <img
        src={imagePath}
        alt={alt}
        className={className}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        onError={(e) => {
          // Fallback to light if dark doesn't exist
          if (theme === 'dark') {
            e.target.src = `/landing/screens/${name}-light.png`;
          }
        }}
      />
    </picture>
  );
}

// BrowserFrame Component - Chrome wrapper for screenshots
function BrowserFrame({ children, title, className = '' }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden ${className}`}>
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
      <div className="bg-white dark:bg-gray-800">
        {children}
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
        <a href="#system" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">System</a>
        <a href="#modules" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">Modules</a>
        <a href="#pricing" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">Pricing</a>
      </nav>
      
      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          aria-label="Toggle theme"
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
          className="bg-black dark:bg-white text-white dark:text-black px-6 py-2.5 text-sm font-medium rounded-lg hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:ring-offset-2"
      >
          Start free
            </Link>
      </div>
    </header>
  );
}

// Hero - Cinematic Screen Mosaic
function Hero() {
  const shouldReduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const containerRef = useRef(null);
  
  // Parallax transforms
  const y1 = useTransform(scrollY, [0, 500], [0, 100]);
  const y2 = useTransform(scrollY, [0, 500], [0, 80]);
  const y3 = useTransform(scrollY, [0, 500], [0, 60]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.8]);
  
  // Pointer parallax
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (shouldReduceMotion) return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        setMousePosition({
          x: (e.clientX - rect.left - rect.width / 2) / rect.width * 20,
          y: (e.clientY - rect.top - rect.height / 2) / rect.height * 20
        });
      }
    };
    
    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      return () => container.removeEventListener('mousemove', handleMouseMove);
    }
  }, [shouldReduceMotion]);
  
  return (
    <section className="relative min-h-screen flex items-center px-6 lg:px-12 pt-24 pb-20 bg-white dark:bg-gray-900 overflow-hidden">
      {/* Animated Background Layers */}
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: shouldReduceMotion ? 0.05 : 0.1 }}
      >
        <motion.div 
          className="absolute top-20 right-20 w-96 h-96 bg-blue-500/10 dark:bg-blue-400/5 rounded-full blur-3xl"
          animate={shouldReduceMotion ? {} : {
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
            y: [0, 20, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/10 dark:bg-purple-400/5 rounded-full blur-3xl"
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
              Run your startup from one operating system.
          </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-xl leading-relaxed">
              WeManageAll unifies projects, resources, calendar, and execution into one calm command center.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Link 
            to="/signup" 
                className="px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors text-sm font-medium text-center focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:ring-offset-2"
          >
                Start free
            </Link>
          <a 
                href="#pricing" 
                className="px-8 py-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-black dark:text-white rounded-lg hover:border-black dark:hover:border-white transition-colors text-sm font-medium text-center focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:ring-offset-2"
          >
                Book a demo
            </a>
          </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-500">
              No credit card required.
            </p>
          </motion.div>

          {/* Right: Screen Mosaic */}
          <div 
            ref={containerRef}
            className="hidden lg:block relative h-[600px]"
          >
            {/* Main Dashboard Screen */}
            <motion.div
              style={{ 
                y: shouldReduceMotion ? 0 : y1,
                opacity: shouldReduceMotion ? 1 : opacity,
                x: shouldReduceMotion ? 0 : mousePosition.x * 0.5,
                rotateY: shouldReduceMotion ? 0 : mousePosition.x * 0.02
              }}
              className="absolute top-0 right-0 w-full max-w-md"
            >
              <BrowserFrame title="Dashboard">
                <ScreenImage name="dashboard" alt="Dashboard view" priority className="w-full h-auto" />
              </BrowserFrame>
            </motion.div>
            
            {/* Projects Screen - Layered */}
            <motion.div
              style={{ 
                y: shouldReduceMotion ? 0 : y2,
                opacity: shouldReduceMotion ? 1 : opacity,
                x: shouldReduceMotion ? 0 : mousePosition.x * 0.3,
                rotateY: shouldReduceMotion ? 0 : mousePosition.x * 0.01
              }}
              className="absolute top-16 right-8 w-full max-w-sm -z-10 opacity-90"
            >
              <BrowserFrame title="Projects">
                <ScreenImage name="projects" alt="Projects view" className="w-full h-auto" />
              </BrowserFrame>
            </motion.div>
            
            {/* Calendar Screen - Depth Layer */}
            <motion.div
              style={{ 
                y: shouldReduceMotion ? 0 : y3,
                opacity: shouldReduceMotion ? 0.7 : opacity,
                x: shouldReduceMotion ? 0 : mousePosition.x * 0.2,
                rotateY: shouldReduceMotion ? 0 : mousePosition.x * 0.005
              }}
              className="absolute top-32 right-16 w-full max-w-xs -z-20 opacity-70"
            >
              <BrowserFrame title="Calendar">
                <ScreenImage name="calendar" alt="Calendar view" className="w-full h-auto" />
              </BrowserFrame>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Proof Band - Animated Counters + Marquee
function ProofBand() {
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
    <section className="py-20 px-6 lg:px-12 bg-gray-50 dark:bg-gray-950 border-y border-gray-200 dark:border-gray-800" id="system">
      <div className="max-w-7xl mx-auto">
        {/* Animated Counters */}
        <div className="grid grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <motion.div 
              className="text-4xl md:text-5xl font-display font-semibold mb-2 text-black dark:text-white"
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
              whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              {counters.teams.toLocaleString()}+
            </motion.div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Teams</div>
          </div>
          <div className="text-center">
            <motion.div 
              className="text-4xl md:text-5xl font-display font-semibold mb-2 text-black dark:text-white"
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
              whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {counters.tasks.toLocaleString()}
            </motion.div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Tasks completed</div>
          </div>
          <div className="text-center">
            <motion.div 
              className="text-4xl md:text-5xl font-display font-semibold mb-2 text-black dark:text-white"
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
              whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {counters.hours.toLocaleString()}
            </motion.div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Hours tracked</div>
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
              <div key={i} className="text-2xl md:text-3xl font-display font-light text-gray-400 dark:text-gray-500 whitespace-nowrap">
                {keyword}
            </div>
          ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Sticky Scrollytelling Tour
function StickyTour() {
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
      description: "Intention, objectives, schedule in one view.",
      screen: "dashboard"
    },
    {
      title: "Ship projects",
      description: "Portfolio, status, progress, owners.",
      screen: "projects"
    },
    {
      title: "Run execution",
      description: "Board/list/timeline/notes in one workspace.",
      screen: "workspace"
    },
    {
      title: "Protect time",
      description: "Calendar blocks and work sessions.",
      screen: "calendar"
    },
    {
      title: "Build knowledge",
      description: "Resources + Lists linked to projects.",
      screen: "resources"
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
                  {step.title}
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
            <div className="relative aspect-[16/10]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={shouldReduceMotion ? {} : { opacity: 0, x: 20 }}
                  animate={shouldReduceMotion ? {} : { opacity: 1, x: 0 }}
                  exit={shouldReduceMotion ? {} : { opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0"
                >
                  <BrowserFrame title={steps[activeStep].title} className="h-full">
                    <ScreenImage 
                      name={steps[activeStep].screen} 
                      alt={`${steps[activeStep].title} view`}
                      className="w-full h-full object-cover"
                    />
                  </BrowserFrame>
                </motion.div>
              </AnimatePresence>
                      </div>
                      </div>
        </div>
      </div>
    </section>
  );
}

// Guided Tour Carousel
function GuidedCarousel() {
  const shouldReduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const progressRef = useRef(null);
  
  const modules = [
    { name: 'Dashboard', screen: 'dashboard' },
    { name: 'Projects', screen: 'projects' },
    { name: 'Workspace', screen: 'workspace' },
    { name: 'Calendar', screen: 'calendar' },
    { name: 'Resources', screen: 'resources' },
    { name: 'Lists', screen: 'lists' }
  ];
  
  // Auto-play
  useEffect(() => {
    if (shouldReduceMotion || isPaused) return;
    
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % modules.length);
    }, 7000);
    
    return () => clearInterval(interval);
  }, [shouldReduceMotion, isPaused, modules.length]);
  
  // Progress bar animation
  useEffect(() => {
    if (shouldReduceMotion || isPaused) {
      if (progressRef.current) {
        progressRef.current.style.width = '0%';
      }
      return;
    }
    
    const progressBar = progressRef.current;
    if (!progressBar) return;
    
    progressBar.style.width = '0%';
    progressBar.style.transition = 'width 7s linear';
    
    const timeout = setTimeout(() => {
      if (progressBar) {
        progressBar.style.width = '100%';
      }
    }, 10);
    
    return () => clearTimeout(timeout);
  }, [activeIndex, shouldReduceMotion, isPaused]);
  
  const handlePrevious = () => {
    setActiveIndex((prev) => (prev - 1 + modules.length) % modules.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000);
  };
  
  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % modules.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000);
  };
            
            return (
    <section className="py-32 px-6 lg:px-12 bg-gray-50 dark:bg-gray-950" id="modules">
      <div className="max-w-7xl mx-auto">
        <motion.h2 
          className="text-4xl md:text-5xl font-display font-semibold text-black dark:text-white mb-16 text-center"
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 30 }}
          whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Every workflow, one system.
        </motion.h2>
        
        <div 
          className="max-w-5xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
        >
          {/* Module Pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {modules.map((module, index) => (
              <button
                key={index} 
                onClick={() => {
                  setActiveIndex(index);
                  setIsPaused(true);
                  setTimeout(() => setIsPaused(false), 10000);
                }}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:ring-offset-2 ${
                  activeIndex === index
                    ? 'bg-black dark:bg-white text-white dark:text-black'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
                }`}
                aria-label={`View ${module.name}`}
              >
                {module.name}
              </button>
            ))}
                </div>

          {/* Screen Display */}
          <div className="relative aspect-[16/10] mb-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={shouldReduceMotion ? {} : { opacity: 0, x: 50 }}
                animate={shouldReduceMotion ? {} : { opacity: 1, x: 0 }}
                exit={shouldReduceMotion ? {} : { opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
              >
                <BrowserFrame title={modules[activeIndex].name} className="h-full">
                  <ScreenImage 
                    name={modules[activeIndex].screen} 
                    alt={`${modules[activeIndex].name} view`}
                    className="w-full h-full object-cover"
                  />
                </BrowserFrame>
              </motion.div>
            </AnimatePresence>
            
            {/* Navigation Arrows */}
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              aria-label="Previous module"
            >
              <svg className="w-6 h-6 text-black dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              aria-label="Next module"
            >
              <svg className="w-6 h-6 text-black dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
                  </div>
          
          {/* Progress Bar */}
          <div className="h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              ref={progressRef}
              className="h-full bg-black dark:bg-white transition-none"
              style={{ width: '0%' }}
            />
                </div>
        </div>
      </div>
    </section>
  );
}

// Enterprise Trust Section
function TrustSection() {
  const shouldReduceMotion = useReducedMotion();
  const features = [
    'Role-based access',
    'Audit-ready workflows',
    'Privacy by design',
    'Fast performance at scale'
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
    <section className="py-32 px-6 lg:px-12 bg-white dark:bg-gray-900" id="pricing">
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
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Link 
            to="/pricing" 
            className="px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:ring-offset-2"
          >
            View pricing
          </Link>
          <Link 
            to="/signup" 
            className="px-8 py-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-black dark:text-white rounded-lg hover:border-black dark:hover:border-white transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:ring-offset-2"
          >
            Start free
          </Link>
        </motion.div>
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
          Ready to unify your workflow?
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
            className="px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:ring-offset-2"
          >
            Start free
            </Link>
          <a 
            href="#modules" 
            className="px-8 py-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-black dark:text-white rounded-lg hover:border-black dark:hover:border-white transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:ring-offset-2"
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
      <ProofBand />
      <StickyTour />
      <GuidedCarousel />
      <TrustSection />
      <PricingCTA />
      <FinalCTA />
      <Footer />
    </div>
  );
}
