import { useRef, useEffect, useState } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';

// Map module IDs to screenshot paths
const MODULE_SCREENSHOTS = {
  dashboard: '/landing/screens/dashboard-light.png',
  projects: '/landing/screens/projects-light.png',
  workspace: '/landing/screens/workspace-light.png',
  calendar: '/landing/screens/calendar-light.png',
  resources: '/landing/screens/resources-light.png',
  lists: '/landing/screens/lists-light.png'
};

export default function HeroProductCard({ activeModule = 'dashboard' }) {
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [imageError, setImageError] = useState(false);
  const rafRef = useRef(null);
  
  const imageSrc = MODULE_SCREENSHOTS[activeModule] || MODULE_SCREENSHOTS.dashboard;
  
  useEffect(() => {
    if (shouldReduceMotion || !containerRef.current) return;
    
    const container = containerRef.current;
    
    const handleMouseMove = (e) => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      
      rafRef.current = requestAnimationFrame(() => {
        const rect = container.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        setMousePos({
          x: Math.max(0, Math.min(100, x)),
          y: Math.max(0, Math.min(100, y))
        });
      });
    };
    
    const handleMouseLeave = () => {
      setMousePos({ x: 50, y: 50 });
    };
    
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [shouldReduceMotion]);
  
  // Calculate tilt based on mouse position (clamped to ~6 degrees)
  const tiltX = shouldReduceMotion ? 0 : ((mousePos.y - 50) / 50) * 6;
  const tiltY = shouldReduceMotion ? 0 : ((mousePos.x - 50) / 50) * -6;
  
  const handleImageError = () => {
    console.warn(`[Landing] Failed to load hero screenshot: ${imageSrc}`);
    setImageError(true);
  };
  
  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[16/10]"
      style={{
        perspective: shouldReduceMotion ? 'none' : '1200px',
        perspectiveOrigin: 'center center'
      }}
    >
      <motion.div
        className="absolute inset-0 rounded-lg overflow-hidden mk-hairline shadow-2xl bg-[var(--mk-surface)]"
        style={{
          borderWidth: '1px',
          rotateX: tiltX,
          rotateY: tiltY,
          transformStyle: 'preserve-3d'
        }}
        transition={{
          type: 'spring',
          damping: 25,
          stiffness: 200
        }}
      >
        {/* Spotlight overlay that follows cursor */}
        {!shouldReduceMotion && (
          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(0, 0, 0, 0.08), transparent 55%)`,
              transition: 'background 0.1s ease-out'
            }}
          />
        )}
        
        {/* Animated border sheen (subtle) */}
        {!shouldReduceMotion && (
          <div
            className="absolute inset-0 pointer-events-none z-10 opacity-30"
            style={{
              background: `linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%)`,
              backgroundSize: '200% 200%',
              mixBlendMode: 'overlay',
              animation: 'hero-shimmer 8s ease-in-out infinite'
            }}
          />
        )}
        
        {/* Image */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeModule}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
            className="absolute inset-0"
          >
            {imageError ? (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-[var(--mk-surface)]">
                <div className="text-sm font-semibold text-[var(--mk-ink)] mb-2">
                  Screenshot missing
                </div>
                <div className="text-xs text-[var(--mk-ink-2)] text-center">
                  Expected {imageSrc} in public/
                </div>
              </div>
            ) : (
              <img
                src={imageSrc}
                alt={`${activeModule} view`}
                className="w-full h-full object-contain"
                loading="eager"
                fetchPriority="high"
                decoding="async"
                onError={handleImageError}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
