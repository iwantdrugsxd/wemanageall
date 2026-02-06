import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import MagneticButton from './MagneticButton';
import { landingCopy } from './landingCopy';

const sectionCTAs = {
  hero: { label: landingCopy.hero.primaryCta, action: '/signup' },
  modules: { label: landingCopy.hero.primaryCta, action: '/signup' },
  system: { label: landingCopy.hero.primaryCta, action: '/signup' },
  pricing: { label: 'View pricing', action: '#pricing' }
};

export default function SmartCTA() {
  const [activeSection, setActiveSection] = useState('hero');
  const sentinelRefs = useRef({});
  
  useEffect(() => {
    const observers = [];
    
    Object.keys(sectionCTAs).forEach((sectionId) => {
      const sentinel = document.getElementById(`sentinel-${sectionId}`);
      if (sentinel) {
        sentinelRefs.current[sectionId] = sentinel;
        
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                setActiveSection(sectionId);
              }
            });
          },
          { threshold: 0.3, rootMargin: '-10% 0px -10% 0px' }
        );
        
        observer.observe(sentinel);
        observers.push(observer);
      }
    });
    
    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, []);
  
  const currentCTA = sectionCTAs[activeSection] || sectionCTAs.hero;
  const isPricing = activeSection === 'pricing';
  
  const handleClick = (e) => {
    if (currentCTA.action.startsWith('#')) {
      e.preventDefault();
      const element = document.querySelector(currentCTA.action);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };
  
  return (
    <>
      {/* Sentinels for intersection observation */}
      <div id="sentinel-hero" className="absolute top-0 left-0 w-full h-1" aria-hidden="true" />
      <div id="sentinel-modules" className="absolute top-0 left-0 w-full h-1" aria-hidden="true" />
      <div id="sentinel-system" className="absolute top-0 left-0 w-full h-1" aria-hidden="true" />
      <div id="sentinel-pricing" className="absolute top-0 left-0 w-full h-1" aria-hidden="true" />
      
      {/* Floating CTA */}
      <div className="fixed bottom-8 right-8 z-50">
        <MagneticButton
          as={Link}
          to={currentCTA.action}
          onClick={handleClick}
          className="px-6 py-3 bg-[var(--mk-ink)] text-[var(--mk-bg)] rounded-lg shadow-lg hover:opacity-90 transition-opacity text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--mk-ink)] focus:ring-offset-2 min-w-[120px] text-center"
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={currentCTA.label}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.2 }}
            >
              {currentCTA.label}
            </motion.span>
          </AnimatePresence>
        </MagneticButton>
      </div>
    </>
  );
}
