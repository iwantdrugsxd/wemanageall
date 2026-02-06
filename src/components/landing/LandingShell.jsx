import { useReducedMotion } from 'framer-motion';

export default function LandingShell({ children }) {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <div className="landing bg-[var(--mk-bg)] text-[var(--mk-ink)]">
      {/* Subtle grid background */}
      <div className="fixed inset-0 mk-grid pointer-events-none" aria-hidden="true" />
      
      {/* Noise overlay */}
      <div className="fixed inset-0 mk-noise pointer-events-none" aria-hidden="true" />
      
      {/* Content */}
      <div className="relative">
        {children}
      </div>
    </div>
  );
}
