import { useState, useRef, useEffect } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { landingCopy } from './landingCopy';

// Map each step to a screenshot - using exact paths from public/
const STEPS = [
  {
    id: 'capture',
    eyebrow: 'CAPTURE THE DAY',
    title: 'Capture the day',
    body: 'Dashboard that shows tasks, intentions, and today\'s focus in one unified view.',
    imageSrc: '/landing/screens/dashboard-light.png',
    imageAlt: 'Dashboard overview showing tasks and intentions'
  },
  {
    id: 'ship',
    eyebrow: 'SHIP PROJECTS',
    title: 'Ship projects',
    body: 'See status, owners, and progress in one table. Saved views keep everyone aligned.',
    imageSrc: '/landing/screens/projects-light.png',
    imageAlt: 'Projects portfolio view with status and progress'
  },
  {
    id: 'run',
    eyebrow: 'RUN EXECUTION',
    title: 'Run execution',
    body: 'Open a project and keep board, list, timeline, and notes together.',
    imageSrc: '/landing/screens/workspace-light.png',
    imageAlt: 'Project workspace with board, list, and timeline'
  },
  {
    id: 'protect',
    eyebrow: 'PROTECT TIME',
    title: 'Protect time',
    body: 'Schedule blocks live beside tasks so plans and execution stay in sync.',
    imageSrc: '/landing/screens/calendar-light.png',
    imageAlt: 'Calendar view with time blocks and tasks'
  },
  {
    id: 'build',
    eyebrow: 'BUILD KNOWLEDGE',
    title: 'Build knowledge',
    body: 'Resources and lists connect to projects so information becomes usable.',
    imageSrc: '/landing/screens/resources-light.png',
    imageAlt: 'Resources library with connected knowledge'
  }
];

export default function StoryScroller() {
  const shouldReduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState({});
  const stepRefs = useRef([]);
  
  // Track active step via IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the entry with the highest intersection ratio
        let maxRatio = 0;
        let maxIndex = activeIndex;
        
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio;
            maxIndex = parseInt(entry.target.getAttribute('data-step-index'));
          }
        });
        
        if (maxRatio > 0.2) {
          setActiveIndex(maxIndex);
        }
      },
      {
        threshold: [0.2, 0.35, 0.5, 0.65],
        rootMargin: '-35% 0px -45% 0px'
      }
    );
    
    stepRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });
    
    return () => {
      stepRefs.current.forEach((el) => {
        if (el) observer.unobserve(el);
      });
    };
  }, [activeIndex]);
  
  const activeStep = STEPS[activeIndex] || STEPS[0];
  const hasError = imageErrors[activeStep.imageSrc];
  
  const handleImageError = (src) => {
    console.warn(`[Landing] Failed to load screenshot: ${src}`);
    setImageErrors((prev) => ({ ...prev, [src]: true }));
  };
  
  return (
    <section
      id="system"
      className="mk-section bg-[var(--mk-surface)]"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-[0.95fr,1.05fr] gap-10 lg:gap-16 items-start">
          {/* Left: Step blocks */}
          <div className="space-y-32 lg:space-y-40">
            {STEPS.map((step, index) => {
              const isActive = activeIndex === index;
              const hasRevealed = activeIndex >= index;
              
              return (
                <motion.div
                  key={step.id}
                  ref={(el) => (stepRefs.current[index] = el)}
                  data-step-index={index}
                  className={`min-h-[300px] transition-opacity duration-500 ${
                    isActive ? 'opacity-100' : 'opacity-30'
                  }`}
                  initial={shouldReduceMotion || hasRevealed ? {} : { opacity: 0, y: 12 }}
                  animate={
                    shouldReduceMotion
                      ? {}
                      : {
                          opacity: isActive ? 1 : 0.3,
                          y: 0
                        }
                  }
                  transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
                >
                  <div className="text-xs uppercase tracking-wider text-[var(--mk-ink-2)] mb-4 font-semibold">
                    {step.eyebrow}
                  </div>
                  <h3 className="mk-h1 mb-6 text-[var(--mk-ink)]">
                    {step.title}
                  </h3>
                  <p className="mk-lead text-[var(--mk-ink-2)]">
                    {step.body}
                  </p>
                </motion.div>
              );
            })}
          </div>
          
          {/* Right: Sticky screen card (desktop) / Above steps (mobile) */}
          <div className="lg:sticky lg:top-24 h-fit order-first lg:order-last">
            <div className="relative aspect-[16/10] rounded-lg overflow-hidden mk-hairline shadow-2xl bg-[var(--mk-surface)]" style={{ borderWidth: '1px' }}>
              {/* Render all images stacked, only active one visible */}
              {STEPS.map((step, index) => {
                const isActive = activeIndex === index;
                const hasError = imageErrors[step.imageSrc];
                
                return (
                  <motion.div
                    key={step.id}
                    className="absolute inset-0"
                    initial={false}
                    animate={{
                      opacity: isActive ? 1 : 0,
                      scale: isActive ? 1 : 1.01
                    }}
                    transition={{
                      opacity: { duration: 0.45, ease: [0.2, 0.8, 0.2, 1] },
                      scale: { duration: 0.65, ease: [0.2, 0.8, 0.2, 1] }
                    }}
                    style={{
                      pointerEvents: isActive ? 'auto' : 'none',
                      zIndex: isActive ? 1 : 0
                    }}
                  >
                    {hasError ? (
                      <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-[var(--mk-surface)] border-2 border-dashed mk-hairline">
                        <div className="text-sm font-semibold text-[var(--mk-ink)] mb-2">
                          Screenshot missing
                        </div>
                        <div className="text-xs text-[var(--mk-ink-2)] text-center">
                          Expected {step.imageSrc} in public/
                        </div>
                      </div>
                    ) : (
                      <img
                        src={step.imageSrc}
                        alt={step.imageAlt}
                        className="w-full h-full object-contain"
                        loading={index === 0 ? 'eager' : 'lazy'}
                        onError={() => handleImageError(step.imageSrc)}
                        decoding="async"
                      />
                    )}
                  </motion.div>
                );
              })}
              
              {/* Fallback if all images fail */}
              {Object.keys(imageErrors).length === STEPS.length && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-[var(--mk-surface)]">
                  <div className="text-sm font-semibold text-[var(--mk-ink)] mb-2">
                    Screenshots missing
                  </div>
                  <div className="text-xs text-[var(--mk-ink-2)] text-center">
                    Expected /landing/screens/*-light.png in public/
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
