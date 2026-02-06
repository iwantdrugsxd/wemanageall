import { useState, useRef, useEffect } from 'react';
import { useReducedMotion } from 'framer-motion';

export default function HoverZoomLens({ children, imageSrc, imageAlt }) {
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef(null);
  const [lensPosition, setLensPosition] = useState({ x: 0, y: 0, visible: false });
  const [imageLoaded, setImageLoaded] = useState(false);
  
  useEffect(() => {
    if (shouldReduceMotion) return;
    
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Check if mouse is within container
      if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
        setLensPosition({
          x: (x / rect.width) * 100,
          y: (y / rect.height) * 100,
          visible: true
        });
      } else {
        setLensPosition(prev => ({ ...prev, visible: false }));
      }
    };
    
    const handleMouseLeave = () => {
      setLensPosition(prev => ({ ...prev, visible: false }));
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
  }, [shouldReduceMotion]);
  
  if (shouldReduceMotion) {
    return <div ref={containerRef}>{children}</div>;
  }
  
  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden"
      style={{ touchAction: 'none' }}
    >
      {children}
      
      {lensPosition.visible && imageLoaded && (
        <div
          className="pointer-events-none absolute z-10 rounded-full border mk-hairline shadow-lg"
          style={{
            width: '160px',
            height: '160px',
            left: `${lensPosition.x}%`,
            top: `${lensPosition.y}%`,
            transform: 'translate(-50%, -50%)',
            backgroundImage: `url(${imageSrc})`,
            backgroundSize: '200%',
            backgroundPosition: `${lensPosition.x}% ${lensPosition.y}%`,
            backgroundRepeat: 'no-repeat',
            mixBlendMode: 'normal',
            borderWidth: '1px',
            borderColor: 'var(--mk-hairline)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}
          aria-hidden="true"
        />
      )}
      
      {/* Preload image for lens */}
      <img
        src={imageSrc}
        alt={imageAlt}
        className="hidden"
        onLoad={() => setImageLoaded(true)}
        loading="eager"
      />
    </div>
  );
}
