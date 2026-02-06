import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion, AnimatePresence } from 'framer-motion';
import HoverZoomLens from './HoverZoomLens';

const screens = [
  { id: 'dashboard', name: 'dashboard' },
  { id: 'projects', name: 'projects' },
  { id: 'workspace', name: 'workspace' },
  { id: 'calendar', name: 'calendar' },
  { id: 'resources', name: 'resources' },
  { id: 'lists', name: 'lists' }
];

export default function ScreenStack3D({ activeModule = 'dashboard' }) {
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef(null);
  
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const scale = useMotionValue(1);
  
  const rotateXSpring = useSpring(rotateX, { damping: 20, stiffness: 150 });
  const rotateYSpring = useSpring(rotateY, { damping: 20, stiffness: 150 });
  const scaleSpring = useSpring(scale, { damping: 20, stiffness: 150 });
  
  useEffect(() => {
    if (shouldReduceMotion) return;
    
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const deltaX = (e.clientX - centerX) / rect.width;
      const deltaY = (e.clientY - centerY) / rect.height;
      
      // Clamp rotations to ~6-9 degrees
      rotateY.set(deltaX * 9);
      rotateX.set(-deltaY * 6);
      
      // Subtle scale based on distance from center
      const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
      scale.set(1 + distance * 0.02);
    };
    
    const handleMouseLeave = () => {
      rotateX.set(0);
      rotateY.set(0);
      scale.set(1);
    };
    
    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', handleMouseLeave);
    }
    
    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [shouldReduceMotion, rotateX, rotateY, scale]);
  
  const activeScreen = screens.find(s => s.id === activeModule) || screens[0];
  const imageSrc = `/landing/screens/${activeScreen.name}-light.png`;
  
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
        className="absolute inset-0"
        style={{
          rotateX: shouldReduceMotion ? 0 : rotateXSpring,
          rotateY: shouldReduceMotion ? 0 : rotateYSpring,
          scale: shouldReduceMotion ? 1 : scaleSpring,
          transformStyle: 'preserve-3d'
        }}
      >
        <HoverZoomLens imageSrc={imageSrc} imageAlt={`${activeScreen.name} view`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeModule}
              initial={{ opacity: 0, scale: 0.95, z: -20 }}
              animate={{ opacity: 1, scale: 1, z: 0 }}
              exit={{ opacity: 0, scale: 1.05, z: 20 }}
              transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
              className="absolute inset-0 rounded-lg overflow-hidden mk-hairline shadow-2xl"
              style={{ borderWidth: '1px' }}
            >
              <img
                src={imageSrc}
                alt={`${activeScreen.name} view`}
                className="w-full h-full object-cover"
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
            </motion.div>
          </AnimatePresence>
        </HoverZoomLens>
      </motion.div>
    </div>
  );
}
