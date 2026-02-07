import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

// Chaos windows configuration - 5 large windows
const CHAOS_WINDOWS = [
  {
    id: 1,
    src: '/landing/screens/projects-light.png',
    label: 'Projects',
    // Chaos position: left 6%, top 18%, rotate -8deg, scale 0.92
    chaosX: 6,
    chaosY: 18,
    chaosRot: -8,
    chaosScale: 0.92,
    zIndex: 3
  },
  {
    id: 2,
    src: '/landing/screens/workspace-light.png',
    label: 'Workspace',
    // Chaos position: left 22%, top 6%, rotate 6deg, scale 0.88
    chaosX: 22,
    chaosY: 6,
    chaosRot: 6,
    chaosScale: 0.88,
    zIndex: 2
  },
  {
    id: 3,
    src: '/landing/screens/calendar-light.png',
    label: 'Calendar',
    // Chaos position: left 40%, top 20%, rotate -3deg, scale 0.94
    chaosX: 40,
    chaosY: 20,
    chaosRot: -3,
    chaosScale: 0.94,
    zIndex: 5
  },
  {
    id: 4,
    src: '/landing/screens/resources-light.png',
    label: 'Resources',
    // Chaos position: left 58%, top 10%, rotate 8deg, scale 0.90
    chaosX: 58,
    chaosY: 10,
    chaosRot: 8,
    chaosScale: 0.90,
    zIndex: 1
  },
  {
    id: 5,
    src: '/landing/screens/lists-light.png',
    label: 'Lists',
    // Chaos position: left 34%, top 38%, rotate 2deg, scale 0.86
    chaosX: 34,
    chaosY: 38,
    chaosRot: 2,
    chaosScale: 0.86,
    zIndex: 4
  }
];

const FINAL_DASHBOARD = '/landing/screens/dashboard-light.png';

// Linear interpolation
function lerp(a, b, t) {
  return a + (b - a) * t;
}

// Smoothstep interpolation
function smoothstep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

// Premium easing curve
function premiumEase(t) {
  return t * t * (3 - 2 * t); // smoothstep
}

// Snap acceleration for merge (0.70 to 0.85)
function snapEase(t) {
  if (t < 0.70) return premiumEase(t / 0.70) * 0.70;
  if (t > 0.85) {
    const remaining = (t - 0.85) / 0.15;
    return 0.85 + premiumEase(remaining) * 0.15;
  }
  // Accelerate in this range
  const localT = (t - 0.70) / 0.15;
  return 0.70 + (localT * localT) * 0.15; // Quadratic acceleration
}

export default function HeroWindowMerge() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [t, setT] = useState(prefersReducedMotion ? 1 : 0.15);
  const [imageErrors, setImageErrors] = useState({});
  
  // Apply premium easing
  const tEase = premiumEase(t);
  // Apply snap acceleration
  const tSnap = snapEase(t);
  
  // Calculate micro-copy based on slider value
  const getMicroCopy = (t) => {
    if (t < 0.33) return 'Too many windows. Context breaks.';
    if (t < 0.66) return 'Bring related work together.';
    return 'One dashboard. Less switching.';
  };

  const [microCopy, setMicroCopy] = useState(() => getMicroCopy(t));

  const handleSliderChange = (e) => {
    const value = parseFloat(e.target.value);
    setT(value);
    setMicroCopy(getMicroCopy(value));
  };

  const handleImageError = (id, src) => {
    console.warn(`[Landing] Failed to load hero asset: ${src}`);
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  // Final dashboard calculations
  const finalOpacity = smoothstep(0.25, 0.85, t);
  const finalBlur = prefersReducedMotion ? 0 : lerp(6, 0, smoothstep(0, 0.85, t));
  
  // Tabs count
  const tabsCount = Math.round(lerp(18, 1, t));
  
  // Check if all images failed
  const allFailed = Object.keys(imageErrors).length === CHAOS_WINDOWS.length + 1;

  return (
    <div className="w-full max-w-[720px] mx-auto">
      {/* Visual Stage */}
      <div className="relative aspect-[16/10] overflow-hidden rounded-[28px] shadow-[0_50px_120px_-80px_rgba(0,0,0,0.65)]">
        {/* Subtle background */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-[var(--mk-surface)]/20 to-[var(--mk-surface)]/40" />
        
        {/* Soft vignette */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(circle at center, transparent 60%, rgba(0,0,0,0.03) 100%)'
        }} />
        
        {/* Final Dashboard (payoff) */}
        {allFailed ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-[var(--mk-surface)] border-2 border-dashed border-black/10">
            <div className="text-sm font-semibold text-[var(--mk-ink)] mb-2">
              Missing hero assets
            </div>
            <div className="text-xs text-[var(--mk-ink-2)] text-center">
              Expected /landing/hero/merge/*.webp in public/
            </div>
          </div>
        ) : (
          <motion.img
            src={FINAL_DASHBOARD}
            alt="WeManageAll Dashboard"
            className="absolute inset-0 h-full w-full object-cover"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            onError={() => handleImageError('final', FINAL_DASHBOARD)}
            animate={{
              opacity: finalOpacity
            }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.4, ease: [0.2, 0.8, 0.2, 1] }}
            style={{
              filter: prefersReducedMotion ? 'none' : `blur(${finalBlur}px)`
            }}
          />
        )}

        {/* Chaos Windows (5 large windows) */}
        {CHAOS_WINDOWS.map((window) => {
          // Calculate transforms
          const x = lerp(window.chaosX, 50, tSnap); // Merge to center (50%)
          const y = lerp(window.chaosY, 50, tSnap); // Merge to center (50%)
          const rot = lerp(window.chaosRot, 0, tEase);
          const scale = lerp(window.chaosScale, 1.0, tEase);
          
          // Opacity: fade out as they merge
          const opacity = t < 0.55 ? 1 : lerp(1, 0, smoothstep(0.55, 0.9, t));
          
          // Blur: only on farthest layers at t near 0
          const isFar = window.zIndex <= 2;
          const blurPx = prefersReducedMotion ? 0 : (t < 0.2 && isFar ? lerp(2, 0, t * 5) : 0);
          
          const hasError = imageErrors[window.id];
          
          return (
            <motion.div
              key={window.id}
              className="absolute"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: '45%',
                height: '55%',
                transform: 'translate(-50%, -50%)',
                zIndex: window.zIndex,
                transformOrigin: 'center center'
              }}
              animate={{
                rotateZ: rot,
                scale,
                opacity
              }}
              transition={{
                type: 'spring',
                damping: 30,
                stiffness: 200,
                duration: prefersReducedMotion ? 0 : undefined
              }}
            >
              <div
                className="relative w-full h-full rounded-[22px] overflow-hidden border border-black/10 bg-white shadow-[0_50px_120px_-80px_rgba(0,0,0,0.65)]"
                style={{
                  filter: blurPx > 0.1 ? `blur(${blurPx}px)` : 'none'
                }}
              >
                {/* Window header strip (geometry only) */}
                <div className="absolute top-0 left-0 right-0 h-[22px] bg-black/5 border-b border-black/5 flex items-center px-3 gap-1.5 z-10">
                  <div className="w-1.5 h-1.5 rounded-full bg-black/20" />
                  <div className="w-1.5 h-1.5 rounded-full bg-black/20" />
                  <div className="w-1.5 h-1.5 rounded-full bg-black/20" />
                </div>
                
                {/* Window image */}
                {hasError ? (
                  <div className="w-full h-full flex items-center justify-center bg-[var(--mk-surface)]">
                    <div className="text-xs text-[var(--mk-ink-2)] text-center px-4">
                      {window.label}
                    </div>
                  </div>
                ) : (
                  <img
                    src={window.src}
                    alt={window.label}
                    className="w-full h-full object-cover"
                    style={{ marginTop: '22px', height: 'calc(100% - 22px)' }}
                    loading={window.id <= 2 ? 'eager' : 'lazy'}
                    decoding="async"
                    onError={() => handleImageError(window.id, window.src)}
                  />
                )}
              </div>
            </motion.div>
          );
        })}

        {/* Tabs count indicator */}
        <div className="absolute top-4 right-4 z-50">
          <div
            className="text-[10px] uppercase tracking-[0.4em] text-black/50 font-semibold"
            style={{
              opacity: lerp(1, 0.3, smoothstep(0.7, 1, t)),
              transition: prefersReducedMotion ? 'none' : 'opacity 0.3s ease'
            }}
          >
            TABS OPEN: {tabsCount}
          </div>
        </div>

        {/* "ONE WORKSPACE" label */}
        {smoothstep(0.8, 1, t) > 0.01 && (
          <motion.div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: smoothstep(0.8, 1, t) }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.4 }}
          >
            <div className="px-3 py-1.5 text-[10px] uppercase tracking-[0.4em] text-black/50 font-semibold bg-white/80 backdrop-blur-sm rounded-full border border-black/5">
              ONE WORKSPACE
            </div>
          </motion.div>
        )}
      </div>

      {/* Slider Control */}
      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-between mb-2">
          <label
            htmlFor="reduce-switching"
            className="text-xs uppercase tracking-wider text-[var(--mk-ink-2)] font-semibold"
          >
            Reduce switching
          </label>
        </div>
        
        <input
          id="reduce-switching"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={t}
          onChange={handleSliderChange}
          aria-label="Reduce switching"
          className="w-full h-1.5 bg-[var(--mk-hairline)] rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, var(--mk-ink) 0%, var(--mk-ink) ${t * 100}%, var(--mk-hairline) ${t * 100}%, var(--mk-hairline) 100%)`
          }}
        />

        {/* Micro-copy */}
        <AnimatePresence mode="wait">
          <motion.p
            key={microCopy}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
            className="text-xs text-[var(--mk-ink-2)] text-center h-5"
          >
            {microCopy}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
