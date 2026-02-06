import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import { landingCopy } from './landingCopy';

export default function TrustGeometry() {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <section className="mk-section bg-[var(--mk-ink)] text-[var(--mk-bg)]">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <motion.h2
          className="mk-h1 mb-16 text-center"
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 30 }}
          whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Enterprise-ready by default.
        </motion.h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {landingCopy.trust.items.map((item, index) => (
            <motion.div
              key={index}
              className="group relative p-6 rounded-lg mk-hairline border-[var(--mk-hairline)] bg-[var(--mk-surface)]/5 hover:bg-[var(--mk-surface)]/10 transition-all duration-300"
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
              whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              style={{ borderWidth: '1px' }}
            >
              {/* Label capsule */}
              <div className="mb-3">
                <span className="text-xs uppercase tracking-wider font-semibold text-[var(--mk-bg)]/70">
                  {item.label}
                </span>
              </div>
              
              {/* Description */}
              <p className="text-sm text-[var(--mk-bg)]/80 leading-relaxed">
                {item.description}
              </p>
              
              {/* Micro-hover glow effect */}
              <div
                className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at center, rgba(255,255,255,0.08) 0%, transparent 70%)'
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
