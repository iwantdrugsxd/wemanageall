import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { landingCopy } from './landingCopy';

export default function ModulePills({ activeModule, onModuleChange }) {
  const [hoveredPill, setHoveredPill] = useState(null);
  
  return (
    <div className="flex flex-wrap justify-center gap-2 mb-8">
      {landingCopy.modules.pills.map((pill) => {
        const isActive = activeModule === pill.id;
        
        return (
          <button
            key={pill.id}
            onClick={() => onModuleChange(pill.id)}
            onMouseEnter={() => setHoveredPill(pill.id)}
            onMouseLeave={() => setHoveredPill(null)}
            className="relative px-4 py-2 text-sm font-medium rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--mk-ink)] focus:ring-offset-2"
            style={{
              backgroundColor: isActive ? 'var(--mk-ink)' : 'transparent',
              color: isActive ? 'var(--mk-bg)' : 'var(--mk-ink-2)',
              border: '1px solid',
              borderColor: isActive ? 'var(--mk-ink)' : 'var(--mk-hairline)'
            }}
          >
            {pill.label}
            {isActive && (
              <motion.div
                layoutId="pillUnderline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--mk-accent)]"
                initial={false}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
