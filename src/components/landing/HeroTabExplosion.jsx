import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

// Tab labels - real founder workflows
const TAB_LABELS = [
  'Figma',
  'Notion',
  'Slack',
  'Gmail',
  'Calendar',
  'Docs',
  'Sheets',
  'Linear',
  'Drive',
  'Stripe',
  'Analytics',
  'Deploy'
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

export default function HeroTabExplosion() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [reduceSwitching, setReduceSwitching] = useState(prefersReducedMotion ? 1 : 0.35);

  // Calculate micro-copy based on slider value
  const getMicroCopy = (t) => {
    if (t < 0.33) return 'Context is scattered. Switching costs pile up.';
    if (t < 0.66) return 'Pull related work into one place.';
    return 'One workspace. Less switching. More shipping.';
  };

  const [microCopy, setMicroCopy] = useState(() => getMicroCopy(reduceSwitching));

  const handleSliderChange = (e) => {
    const value = parseFloat(e.target.value);
    setReduceSwitching(value);
    setMicroCopy(getMicroCopy(value));
  };

  const n = TAB_LABELS.length;
  const t = reduceSwitching;

  // Workspace opacity
  const workspaceOpacity = smoothstep(0.65, 1, t);
  const tabsOpacity = 1 - smoothstep(0.7, 1, t);

  return (
    <div className="w-full">
      {/* Visualization Container */}
      <div 
        className="relative h-[360px] mb-8"
        style={{
          perspective: prefersReducedMotion ? 'none' : '1200px',
          perspectiveOrigin: 'center center'
        }}
      >
        {/* Workspace Surface (calm state) */}
        <AnimatePresence>
          {workspaceOpacity > 0.01 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: workspaceOpacity }}
              exit={{ opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.4 }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{
                width: '420px',
                height: '280px'
              }}
            >
              <div className="w-full h-full rounded-[28px] border border-black/10 bg-white shadow-[0_40px_120px_-80px_rgba(0,0,0,0.55)]">
                {/* Interior grid hint */}
                <div className="h-full p-6 flex flex-col gap-4">
                  {/* Three column hint */}
                  <div className="flex-1 flex gap-3">
                    <div className="flex-1 border-r border-black/5 pr-3">
                      <div className="text-xs uppercase tracking-wider text-black/40 mb-2 font-semibold">
                        Projects
                      </div>
                      <div className="space-y-1.5">
                        <div className="h-2 bg-black/5 rounded w-3/4" />
                        <div className="h-2 bg-black/5 rounded w-2/3" />
                        <div className="h-2 bg-black/5 rounded w-4/5" />
                      </div>
                    </div>
                    <div className="flex-1 border-r border-black/5 pr-3">
                      <div className="text-xs uppercase tracking-wider text-black/40 mb-2 font-semibold">
                        Today
                      </div>
                      <div className="space-y-1.5">
                        <div className="h-2 bg-black/5 rounded w-full" />
                        <div className="h-2 bg-black/5 rounded w-5/6" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs uppercase tracking-wider text-black/40 mb-2 font-semibold">
                        Knowledge
                      </div>
                      <div className="space-y-1.5">
                        <div className="h-2 bg-black/5 rounded w-4/5" />
                        <div className="h-2 bg-black/5 rounded w-3/4" />
                        <div className="h-2 bg-black/5 rounded w-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs (chaos state) */}
        {tabsOpacity > 0.01 && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {TAB_LABELS.map((label, i) => {
              // Chaos values
              const xChaos = (i - (n - 1) / 2) * 46;
              const yChaos = (pseudoRandom(i) - 0.5) * 22;
              const rotChaos = (pseudoRandom(i + 100) - 0.5) * 6;
              const zChaos = (pseudoRandom(i + 200) - 0.5) * 18;
              const blurChaos = pseudoRandom(i + 300) * 2.2;

              // Interpolated values
              const x = lerp(xChaos, 0, t);
              const y = lerp(yChaos, 0, t);
              const rot = prefersReducedMotion ? 0 : lerp(rotChaos, 0, t);
              const z = prefersReducedMotion ? 0 : lerp(zChaos, 0, t);
              const blur = prefersReducedMotion ? 0 : lerp(blurChaos, 0, t);

              return (
                <motion.div
                  key={label}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                  animate={{
                    x,
                    y,
                    rotateZ: rot,
                    z,
                    opacity: tabsOpacity,
                    filter: blur > 0.1 ? `blur(${blur}px)` : 'none'
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
                    className="px-4 py-2 rounded-xl border border-black/10 bg-white/90 backdrop-blur-sm shadow-sm"
                    style={{
                      whiteSpace: 'nowrap',
                      fontSize: '11px',
                      fontWeight: 500,
                      letterSpacing: '0.02em',
                      textTransform: 'uppercase',
                      color: 'rgba(0, 0, 0, 0.7)'
                    }}
                  >
                    {label}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Slider Control */}
      <div className="space-y-3">
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
          value={reduceSwitching}
          onChange={handleSliderChange}
          aria-label="Reduce switching"
          className="w-full h-1.5 bg-[var(--mk-hairline)] rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, var(--mk-ink) 0%, var(--mk-ink) ${reduceSwitching * 100}%, var(--mk-hairline) ${reduceSwitching * 100}%, var(--mk-hairline) 100%)`
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
