import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { landingCopy } from './landingCopy';
import MagneticButton from './MagneticButton';

export default function FinalCTA() {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <section className="mk-section bg-[var(--mk-surface)] border-t mk-hairline" style={{ borderTopWidth: '1px' }}>
      <div className="max-w-4xl mx-auto px-6 lg:px-10 text-center">
        <motion.h2
          className="mk-h1 mb-6 text-[var(--mk-ink)]"
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 30 }}
          whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {landingCopy.finalCta.title}
        </motion.h2>
        
        <motion.p
          className="mk-lead mb-10 text-[var(--mk-ink-2)]"
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {landingCopy.finalCta.subtitle}
        </motion.p>
        
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <MagneticButton
            as={Link}
            to="/signup"
            className="px-8 py-4 bg-[var(--mk-ink)] text-[var(--mk-bg)] rounded-lg hover:opacity-90 transition-opacity text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--mk-ink)] focus:ring-offset-2"
          >
            {landingCopy.finalCta.cta}
          </MagneticButton>
          
          <a
            href="#modules"
            onClick={(e) => {
              e.preventDefault();
              const element = document.querySelector('#modules');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
            className="px-8 py-4 bg-[var(--mk-surface)] border mk-hairline text-[var(--mk-ink)] rounded-lg hover:border-[var(--mk-ink)] transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--mk-ink)] focus:ring-offset-2"
            style={{ borderWidth: '1px' }}
          >
            {landingCopy.finalCta.secondaryCta}
          </a>
        </motion.div>
      </div>
    </section>
  );
}
