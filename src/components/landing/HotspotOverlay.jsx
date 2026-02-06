import { motion } from 'framer-motion';

export default function HotspotOverlay({ hotspot, isActive }) {
  if (!isActive || !hotspot) return null;
  
  const { xPct, yPct, wPct, hPct } = hotspot;
  
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Dimming mask outside hotspot */}
      <div
        className="absolute inset-0 bg-[var(--mk-ink)]/5"
        style={{
          maskImage: `radial-gradient(ellipse ${wPct * 1.5}% ${hPct * 1.5}% at ${xPct + wPct / 2}% ${yPct + hPct / 2}%, transparent 40%, black 60%)`,
          WebkitMaskImage: `radial-gradient(ellipse ${wPct * 1.5}% ${hPct * 1.5}% at ${xPct + wPct / 2}% ${yPct + hPct / 2}%, transparent 40%, black 60%)`
        }}
      />
      
      {/* Hotspot outline */}
      <motion.div
        className="absolute border-2 border-[var(--mk-accent)] rounded"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          left: `${xPct}%`,
          top: `${yPct}%`,
          width: `${wPct}%`,
          height: `${hPct}%`,
          boxShadow: '0 0 0 2px var(--mk-bg), 0 0 12px rgba(249, 115, 22, 0.3)'
        }}
      />
    </div>
  );
}
