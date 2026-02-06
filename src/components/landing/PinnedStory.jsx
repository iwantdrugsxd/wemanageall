import { useState, useRef, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { landingCopy } from './landingCopy';
import HotspotOverlay from './HotspotOverlay';
import HoverZoomLens from './HoverZoomLens';

// Hotspot definitions for each step (percentages of image)
const hotspots = [
  { xPct: 5, yPct: 10, wPct: 90, hPct: 25 }, // Step 1: Portfolio table
  { xPct: 10, yPct: 30, wPct: 80, hPct: 60 }, // Step 2: Workspace context
  { xPct: 60, yPct: 5, wPct: 35, hPct: 30 }, // Step 3: Calendar blocks
  { xPct: 5, yPct: 60, wPct: 40, hPct: 35 }  // Step 4: Resources sidebar
];

const pinnedImage = 'projects-light.png'; // Best representative screenshot

export default function PinnedStory() {
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef(null);
  const [activeStep, setActiveStep] = useState(0);
  
  // Track active step via IntersectionObserver
  useEffect(() => {
    const stepElements = document.querySelectorAll('[data-story-step]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const stepIndex = parseInt(entry.target.getAttribute('data-story-step'));
            setActiveStep(stepIndex);
          }
        });
      },
      { threshold: 0.5, rootMargin: '-20% 0px -20% 0px' }
    );
    
    stepElements.forEach((el) => observer.observe(el));
    
    return () => {
      stepElements.forEach((el) => observer.unobserve(el));
    };
  }, []);
  
  // Transform image based on active step
  // Calculate transforms based on active step
  const getImageTransform = () => {
    if (shouldReduceMotion || !hotspots[activeStep]) {
      return { scale: 1, x: 0, y: 0 };
    }
    const hotspot = hotspots[activeStep];
    return {
      scale: 1.2,
      x: -(hotspot.xPct + hotspot.wPct / 2 - 50) * 0.3,
      y: -(hotspot.yPct + hotspot.hPct / 2 - 50) * 0.3
    };
  };
  
  const imageTransform = getImageTransform();
  
  const imageSrc = `/landing/screens/${pinnedImage}`;
  
  return (
    <section
      ref={containerRef}
      id="system"
      className="mk-section bg-[var(--mk-surface)]"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left: Step blocks */}
          <div className="space-y-32 lg:space-y-40">
            {landingCopy.story.steps.map((step, index) => (
              <motion.div
                key={index}
                data-story-step={index}
                className={`min-h-[300px] transition-opacity duration-500 ${
                  activeStep === index ? 'opacity-100' : 'opacity-30'
                }`}
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 30 }}
                whileInView={shouldReduceMotion ? {} : { opacity: activeStep === index ? 1 : 0.3, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.6 }}
              >
                <div className="text-xs uppercase tracking-wider text-[var(--mk-ink-2)] mb-4 font-semibold">
                  {step.title}
                </div>
                <h3 className="mk-h1 mb-6 text-[var(--mk-ink)]">
                  {step.title}
                </h3>
                <p className="mk-lead text-[var(--mk-ink-2)]">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
          
          {/* Right: Sticky pinned image */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="relative aspect-[16/10] rounded-lg overflow-hidden mk-hairline shadow-2xl" style={{ borderWidth: '1px' }}>
              <HoverZoomLens imageSrc={imageSrc} imageAlt="Projects workspace view">
                <motion.div
                  className="absolute inset-0"
                  animate={{
                    scale: imageTransform.scale,
                    x: imageTransform.x,
                    y: imageTransform.y
                  }}
                  transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
                  style={{
                    transformOrigin: 'center center'
                  }}
                >
                  <img
                    src={imageSrc}
                    srcSet={`${imageSrc} 1x, ${imageSrc.replace('-light.png', '-light.png')} 2x`}
                    alt="Projects workspace view"
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </motion.div>
              </HoverZoomLens>
              
              <HotspotOverlay hotspot={hotspots[activeStep]} isActive={true} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
