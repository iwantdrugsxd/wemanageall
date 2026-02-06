import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { landingCopy } from './landingCopy';
import ScreenStack3D from './ScreenStack3D';
import ModulePills from './ModulePills';
import MagneticButton from './MagneticButton';

export default function Hero() {
  const shouldReduceMotion = useReducedMotion();
  const [activeModule, setActiveModule] = useState('dashboard');
  
  const activeDescription = landingCopy.modules.descriptions[activeModule] || landingCopy.modules.descriptions.dashboard;
  
  return (
    <section className="relative min-h-screen flex items-center mk-section pt-24">
      <div className="max-w-7xl mx-auto w-full px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Editorial Text */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 30 }}
            animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <h1 className="mk-h1 mb-6 text-[var(--mk-ink)]">
              {landingCopy.hero.title}
            </h1>
            
            <p className="mk-lead mb-4 text-[var(--mk-ink-2)]">
              {landingCopy.hero.subtitle}
            </p>
            
            {/* Module description - updates with active pill */}
            <motion.p
              key={activeModule}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-sm text-[var(--mk-ink-2)] mb-8"
            >
              {activeDescription}
            </motion.p>
            
            {/* Module Pills */}
            <div className="mb-8">
              <ModulePills activeModule={activeModule} onModuleChange={setActiveModule} />
            </div>
            
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

          {/* Right: 3D Screen Stack */}
          <div className="hidden lg:block">
            <ScreenStack3D activeModule={activeModule} />
          </div>
          
          {/* Mobile: Single image */}
          <div className="lg:hidden">
            <div className="relative w-full aspect-[16/10] rounded-lg overflow-hidden mk-hairline shadow-xl" style={{ borderWidth: '1px' }}>
              <img
                src={`/landing/screens/${activeModule}-light.png`}
                alt={`${activeModule} view`}
                className="w-full h-full object-cover"
                loading="eager"
                fetchPriority="high"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
