import { useState, useRef, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

// Tile configuration - using existing screenshots as tiles (will be replaced with dedicated tiles)
const TILES = [
  { id: 1, src: '/landing/screens/projects-light.png', label: 'Projects' },
  { id: 2, src: '/landing/screens/workspace-light.png', label: 'Workspace' },
  { id: 3, src: '/landing/screens/calendar-light.png', label: 'Calendar' },
  { id: 4, src: '/landing/screens/dashboard-light.png', label: 'Dashboard' },
  { id: 5, src: '/landing/screens/resources-light.png', label: 'Resources' },
  { id: 6, src: '/landing/screens/lists-light.png', label: 'Lists' },
  { id: 7, src: '/landing/screens/projects-light.png', label: 'Projects' },
  { id: 8, src: '/landing/screens/workspace-light.png', label: 'Workspace' },
  { id: 9, src: '/landing/screens/calendar-light.png', label: 'Calendar' },
  { id: 10, src: '/landing/screens/dashboard-light.png', label: 'Dashboard' },
  { id: 11, src: '/landing/screens/resources-light.png', label: 'Resources' },
  { id: 12, src: '/landing/screens/lists-light.png', label: 'Lists' },
  { id: 13, src: '/landing/screens/projects-light.png', label: 'Projects' },
  { id: 14, src: '/landing/screens/workspace-light.png', label: 'Workspace' },
  { id: 15, src: '/landing/screens/calendar-light.png', label: 'Calendar' },
  { id: 16, src: '/landing/screens/dashboard-light.png', label: 'Dashboard' }
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

// Ease in-out cubic for magnetic snap
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export default function HeroChaosReveal({
  imageSrc = '/landing/screens/dashboard-light.png',
  imageSrcSet
}) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const shouldReduceMotion = useReducedMotion();
  const [t, setT] = useState(prefersReducedMotion ? 1 : 0.25);
  const [imageError, setImageError] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const stageRef = useRef(null);
  const rafRef = useRef(null);
  
  const n = TILES.length;
  const mid = (n - 1) / 2;
  
  // Apply easing for magnetic snap effect
  const tEased = easeInOutCubic(t);
  
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

  // Pointer parallax effect
  useEffect(() => {
    if (shouldReduceMotion || !stageRef.current) return;
    
    const stage = stageRef.current;
    
    const handleMouseMove = (e) => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      
      rafRef.current = requestAnimationFrame(() => {
        const rect = stage.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width);
        const y = ((e.clientY - rect.top) / rect.height);
        
        setMousePos({
          x: Math.max(0, Math.min(1, x)),
          y: Math.max(0, Math.min(1, y))
        });
      });
    };
    
    const handleMouseLeave = () => {
      setMousePos({ x: 0.5, y: 0.5 });
    };
    
    stage.addEventListener('mousemove', handleMouseMove);
    stage.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      stage.removeEventListener('mousemove', handleMouseMove);
      stage.removeEventListener('mouseleave', handleMouseLeave);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [shouldReduceMotion]);

  // Screenshot reveal calculations
  const veilOpacity = lerp(0.72, 0, t);
  const desaturate = lerp(0.25, 0, t);
  const contrast = lerp(0.92, 1, t);
  const blurAmount = prefersReducedMotion ? 0 : lerp(4, 0, t);
  
  // Tabs count indicator
  const tabsCount = Math.round(lerp(27, 1, t));
  
  // Parallax offset (subtle)
  const parallaxX = shouldReduceMotion ? 0 : (mousePos.x - 0.5) * 6;
  const parallaxY = shouldReduceMotion ? 0 : (mousePos.y - 0.5) * 6;
  const parallaxRot = shouldReduceMotion ? 0 : (mousePos.x - 0.5) * 2;

  return (
    <div className="w-full max-w-[720px] mx-auto">
      {/* Visual Stage */}
      <div
        ref={stageRef}
        className="relative aspect-[16/10] overflow-hidden rounded-[28px] shadow-[0_40px_120px_-80px_rgba(0,0,0,0.55)]"
        style={{
          perspective: shouldReduceMotion ? 'none' : '1200px',
          perspectiveOrigin: 'center center',
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-[var(--mk-surface)]/30 to-[var(--mk-surface)]/50" />
        
        {/* Reveal Screenshot Layer */}
        <div className="absolute inset-0">
          {imageError ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-[var(--mk-surface)] border-2 border-dashed border-black/10">
              <div className="text-sm font-semibold text-[var(--mk-ink)] mb-2">
                Missing hero screenshot
              </div>
              <div className="text-xs text-[var(--mk-ink-2)] text-center">
                Add {imageSrc} in public/
              </div>
            </div>
          ) : (
            <motion.img
              src={imageSrc}
              srcSet={imageSrcSet}
              alt="WeManageAll workspace"
              className="absolute inset-0 h-full w-full object-cover"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              onError={() => setImageError(true)}
              animate={{
                opacity: lerp(0.35, 1, t),
                x: parallaxX,
                y: parallaxY,
                rotateZ: parallaxRot
              }}
              transition={{ type: 'spring', damping: 30, stiffness: 200 }}
              style={{
                filter: prefersReducedMotion
                  ? 'none'
                  : `grayscale(${desaturate}) contrast(${contrast}) blur(${blurAmount}px)`
              }}
            />
          )}
          
          {/* Veil overlay */}
          <div
            className="absolute inset-0 bg-white pointer-events-none"
            style={{
              opacity: veilOpacity,
              transition: prefersReducedMotion ? 'none' : 'opacity 0.3s ease'
            }}
          />
        </div>

        {/* Chaos Tiles Layer */}
        <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
          {TILES.map((tile, i) => {
            // Chaos positions - spread across stage, overlapping naturally
            const xChaos = (i - mid) * 68 + (pseudoRandom(i + 100) - 0.5) * 40;
            const yChaos = (pseudoRandom(i + 200) - 0.5) * 60;
            const rotChaos = (pseudoRandom(i + 300) - 0.5) * 12;
            const zChaos = (pseudoRandom(i + 400) - 0.5) * 40;
            const scaleChaos = 0.75 + pseudoRandom(i + 500) * 0.35; // 0.75x to 1.1x
            
            // Calm positions - collapse toward center
            const xCalm = (i - mid) * 8;
            const yCalm = -10;
            const rotCalm = 0;
            const zCalm = 0;
            const scaleCalm = 0.88;
            
            // Interpolate with eased t for magnetic snap
            const x = lerp(xChaos, xCalm, tEased) + parallaxX * (1 - t);
            const y = lerp(yChaos, yCalm, tEased) + parallaxY * (1 - t);
            const rot = prefersReducedMotion ? 0 : lerp(rotChaos, rotCalm, tEased);
            const z = prefersReducedMotion ? 0 : lerp(zChaos, zCalm, tEased);
            const scale = lerp(scaleChaos, scaleCalm, tEased);
            
            // Opacity: fade out as tiles collapse
            const opacity = 1 - smoothstep(0.55, 0.9, t);
            
            // Blur based on depth and t
            const zFactor = Math.abs(zChaos) / 40;
            const blurPx = prefersReducedMotion ? 0 : (1 - t) * zFactor * 2.2;
            
            // Shadow intensity based on depth
            const shadowIntensity = 0.15 + Math.abs(zChaos) * 0.003;
            const shadowBlur = Math.abs(zChaos) * 0.4;
            
            // Last tile (WeManageAll) stays longer
            const isLast = i === n - 1;
            const finalOpacity = isLast ? (1 - smoothstep(0.75, 1, t)) : opacity;
            
            return (
              <motion.div
                key={tile.id}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{
                  zIndex: Math.round(10 + zChaos * 0.1),
                  transformStyle: 'preserve-3d'
                }}
                animate={{
                  x,
                  y,
                  rotateZ: rot,
                  z,
                  scale,
                  opacity: finalOpacity
                }}
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : {
                        type: 'spring',
                        damping: 28,
                        stiffness: 180
                      }
                }
              >
                <div
                  className="relative rounded-lg overflow-hidden border border-black/10 bg-white shadow-lg"
                  style={{
                    width: '240px',
                    height: '150px',
                    boxShadow: `0 ${shadowBlur}px ${shadowBlur * 2}px rgba(0, 0, 0, ${shadowIntensity})`,
                    filter: blurPx > 0.1 ? `blur(${blurPx}px)` : 'none'
                  }}
                >
                  {/* Tab strip (subtle geometry) */}
                  <div className="absolute top-0 left-0 right-0 h-6 bg-black/5 border-b border-black/5 flex items-center px-2 gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-black/20" />
                    <div className="w-1.5 h-1.5 rounded-full bg-black/20" />
                    <div className="w-1.5 h-1.5 rounded-full bg-black/20" />
                  </div>
                  
                  {/* Tile image */}
                  <img
                    src={tile.src}
                    alt={tile.label}
                    className="w-full h-full object-cover"
                    style={{ marginTop: '24px', height: 'calc(100% - 24px)' }}
                    loading={i < 4 ? 'eager' : 'lazy'}
                    decoding="async"
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

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
        {smoothstep(0.75, 1, t) > 0.01 && (
          <motion.div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: smoothstep(0.75, 1, t) }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.4 }}
          >
            <div className="text-[10px] uppercase tracking-[0.4em] text-black/50 font-semibold">
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
      </div>
    </div>
  );
}
