import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

// Tab labels - professional workflow tools (more tabs for scattered, overwhelming feeling)
const TAB_LABELS = [
  'Email',
  'Calendar',
  'Docs',
  'Design',
  'Tasks',
  'Analytics',
  'Deploy',
  'CRM',
  'Invoices',
  'Hiring',
  'Support',
  'Slack',
  'Notion',
  'Figma',
  'Linear',
  'Stripe',
  'Drive',
  'Sheets',
  'Meetings',
  'Chat',
  'Code',
  'Monitor',
  'GitHub',
  'Jira',
  'Trello',
  'Asana',
  'Zoom',
  'Teams',
  'Dropbox',
  'OneDrive'
];

// Deterministic pseudo-random function
function pseudoRandom(seed) {
  return (Math.sin(seed * 999) * 10000) % 1;
}

// Smoothstep interpolation
function smoothstep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

// Linear interpolation
function lerp(a, b, t) {
  return a + (b - a) * t;
}

export default function TabStormReveal({
  imageSrc = '/landing/screens/dashboard-light.png',
  imageSrcSet,
  initialValue
}) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [t, setT] = useState(initialValue !== undefined ? initialValue : (prefersReducedMotion ? 1 : 0.25));
  const [imageError, setImageError] = useState(false);
  
  const n = TAB_LABELS.length;
  const mid = (n - 1) / 2;
  
  // Calculate micro-copy based on slider value
  const getMicroCopy = (t) => {
    if (t < 0.33) return 'Context is scattered. Switching costs pile up.';
    if (t < 0.66) return 'Pull related work into one place.';
    return 'One workspace. Less switching. More shipping.';
  };

  const [microCopy, setMicroCopy] = useState(() => getMicroCopy(t));

  const handleSliderChange = (e) => {
    const value = parseFloat(e.target.value);
    setT(value);
    setMicroCopy(getMicroCopy(value));
  };

  // Screenshot reveal calculations
  const veilOpacity = lerp(0.75, 0, t);
  const desaturate = lerp(0.35, 0, t);
  const contrast = lerp(0.95, 1, t);
  const blurAmount = prefersReducedMotion ? 0 : lerp(6, 0, t);
  
  // Tabs count indicator - increased to match more tabs
  const tabsCount = Math.round(lerp(35, 1, t));
  
  // "ONE WORKSPACE" label opacity
  const workspaceLabelOpacity = smoothstep(0.75, 1, t);

  return (
    <div className="w-full max-w-[720px] mx-auto">
      {/* Visual Container */}
      <div className="relative aspect-[16/10] overflow-hidden rounded-[28px] shadow-[0_40px_120px_-80px_rgba(0,0,0,0.55)]">
        {/* Layer 1: Screenshot Reveal */}
        <div className="absolute inset-0">
          {imageError ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-[var(--mk-surface)] border-2 border-dashed border-black/10">
              <div className="text-sm font-semibold text-[var(--mk-ink)] mb-2">
                Missing hero screenshot
              </div>
              <div className="text-xs text-[var(--mk-ink-2)] text-center">
                Add /public/landing/screens/hero-reveal.webp
              </div>
            </div>
          ) : (
            <img
              src={imageSrc}
              srcSet={imageSrcSet}
              alt="WeManageAll workspace"
              className="absolute inset-0 h-full w-full object-cover"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              onError={() => setImageError(true)}
              style={{
                opacity: lerp(0.3, 1, t),
                filter: prefersReducedMotion
                  ? 'none'
                  : `grayscale(${desaturate}) contrast(${contrast}) blur(${blurAmount}px)`
              }}
            />
          )}
          
          {/* Veil overlay */}
          <div
            className="absolute inset-0 bg-white"
            style={{
              opacity: veilOpacity,
              transition: prefersReducedMotion ? 'none' : 'opacity 0.3s ease'
            }}
          />
          
          {/* Spotlight gradient (subtle) */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at center, transparent 0%, rgba(0,0,0,${lerp(0.08, 0, t)}) 100%)`,
              transition: prefersReducedMotion ? 'none' : 'background 0.3s ease'
            }}
          />
        </div>

        {/* Layer 2: Tab Storm */}
        <div className="absolute inset-0">
          {TAB_LABELS.map((label, i) => {
            // More scattered chaos positions - wider spread, more variation
            const xChaos = (i - mid) * 68; // Increased from 42 to 68 for wider spread
            const yChaos = (pseudoRandom(i) - 0.5) * 48; // Increased from 28 to 48 for more vertical scatter
            const rotChaos = (pseudoRandom(i + 9) - 0.5) * 18; // Increased from 10 to 18 for more dramatic rotation
            const zChaos = (pseudoRandom(i + 20) - 0.5) * 30; // Add depth variation
            
            // Size variation - some tabs bigger, some smaller
            const sizeVariation = 0.75 + pseudoRandom(i + 30) * 0.5; // 0.75x to 1.25x scale
            
            // Calm positions (collapse into tight stack)
            const xCalm = (i - mid) * 6;
            const yCalm = -8;
            const rotCalm = 0;
            const zCalm = 0;
            
            // Interpolate
            const x = lerp(xChaos, xCalm, t);
            const y = lerp(yChaos, yCalm, t);
            const rot = prefersReducedMotion ? 0 : lerp(rotChaos, rotCalm, t);
            const z = prefersReducedMotion ? 0 : lerp(zChaos, zCalm, t);
            const scale = lerp(sizeVariation, 1, t * 0.5); // Tabs normalize size as they collapse
            
            // Opacity: fade out all tabs as they collapse
            const opacity = lerp(1, 0, smoothstep(0.72, 1, t));
            
            // Depth-based shadow and opacity for layering effect
            const depthOpacity = 0.6 + (pseudoRandom(i + 40) * 0.4); // 0.6 to 1.0
            const shadowBlur = Math.abs(zChaos) * 0.3;
            
            return (
              <motion.div
                key={label}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{
                  zIndex: Math.round(10 + zChaos * 0.1)
                }}
                animate={{
                  x,
                  y,
                  rotateZ: rot,
                  z,
                  scale,
                  opacity: opacity * depthOpacity
                }}
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : {
                        type: 'spring',
                        damping: 25,
                        stiffness: 150
                      }
                }
              >
                <div
                  className="px-3 py-1.5 rounded-lg border border-black/10 bg-white/90 backdrop-blur-sm"
                  style={{
                    whiteSpace: 'nowrap',
                    fontSize: '10px',
                    fontWeight: 500,
                    letterSpacing: '0.25em',
                    textTransform: 'uppercase',
                    color: 'rgba(0, 0, 0, 0.6)',
                    boxShadow: `0 ${shadowBlur}px ${shadowBlur * 2}px rgba(0, 0, 0, ${0.15 + Math.abs(zChaos) * 0.05})`
                  }}
                >
                  {label}
                </div>
              </motion.div>
            );
          })}
          
          {/* Add "WeManageAll" tab that survives and centers (not in TAB_LABELS) */}
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ zIndex: 100 }}
            animate={{
              x: lerp((n - mid) * 68, 0, t), // Match wider spread
              y: lerp((pseudoRandom(n) - 0.5) * 48, -8, t), // Match more vertical scatter
              rotateZ: prefersReducedMotion ? 0 : lerp((pseudoRandom(n + 9) - 0.5) * 18, 0, t), // Match more rotation
              opacity: 1,
              scale: lerp(1, 1.05, smoothstep(0.8, 1, t))
            }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : {
                    type: 'spring',
                    damping: 25,
                    stiffness: 150
                  }
            }
          >
            <div
              className="px-3 py-1.5 rounded-lg border border-black/10 bg-white/95 backdrop-blur-sm shadow-md"
              style={{
                whiteSpace: 'nowrap',
                fontSize: '10px',
                fontWeight: 600,
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color: 'rgba(0, 0, 0, 0.8)'
              }}
            >
              WeManageAll
            </div>
          </motion.div>
        </div>

        {/* Tabs count indicator */}
        <div className="absolute top-4 right-4">
          <div
            className="text-[10px] uppercase tracking-[0.4em] text-black/50 font-semibold"
            style={{
              opacity: lerp(1, 0.3, smoothstep(0.7, 1, t)),
              transition: prefersReducedMotion ? 'none' : 'opacity 0.3s ease'
            }}
          >
            Tabs open: {tabsCount}
          </div>
        </div>

        {/* "ONE WORKSPACE" label */}
        {workspaceLabelOpacity > 0.01 && (
          <motion.div
            className="absolute bottom-6 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: workspaceLabelOpacity }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.4 }}
          >
            <div
              className="text-[10px] uppercase tracking-[0.4em] text-black/50 font-semibold"
            >
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
