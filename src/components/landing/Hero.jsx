import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { landingCopy } from './landingCopy';
import HeroTabExplosion from './HeroTabExplosion';
import MagneticButton from './MagneticButton';

export default function Hero() {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <section className="relative min-h-screen flex items-center mk-section pt-24">
      <div className="max-w-7xl mx-auto w-full px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left: Editorial Text */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 30 }}
            animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <h1 className="mk-h1 mb-6 text-[var(--mk-ink)]">
              {landingCopy.hero.title}
            </h1>
            
            <p className="mk-lead mb-8 text-[var(--mk-ink-2)]">
              {landingCopy.hero.subtitle}
            </p>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <MagneticButton
                as={Link}
                to="/signup"
                className="px-8 py-4 bg-[var(--mk-ink)] text-[var(--mk-bg)] rounded-lg hover:opacity-90 transition-opacity text-sm font-medium text-center focus:outline-none focus:ring-2 focus:ring-[var(--mk-ink)] focus:ring-offset-2"
              >
                {landingCopy.hero.primaryCta}
              </MagneticButton>
              
              <a
                href="#pricing"
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.querySelector('#pricing');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="px-8 py-4 bg-[var(--mk-surface)] border mk-hairline text-[var(--mk-ink)] rounded-lg hover:border-[var(--mk-ink)] transition-colors text-sm font-medium text-center focus:outline-none focus:ring-2 focus:ring-[var(--mk-ink)] focus:ring-offset-2"
                style={{ borderWidth: '1px' }}
              >
                {landingCopy.hero.secondaryCta}
              </a>
            </div>
            
            <p className="text-sm text-[var(--mk-ink-2)]">
              No credit card required.
            </p>
          </motion.div>

          {/* Right: Tab Explosion Visualization */}
          <div className="w-full">
            <HeroTabExplosion />
          </div>
        </div>
      </div>
    </section>
  );
}
