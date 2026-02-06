import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { landingCopy } from './landingCopy';

export default function PricingTeaser() {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <section id="pricing" className="mk-section bg-[var(--mk-bg)]">
      <div className="max-w-4xl mx-auto px-6 lg:px-10 text-center">
        <motion.h2
          className="mk-h1 mb-6 text-[var(--mk-ink)]"
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 30 }}
          whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {landingCopy.pricingTeaser.title}
        </motion.h2>
        
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {landingCopy.pricingTeaser.plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              className="p-8 rounded-lg mk-hairline bg-[var(--mk-surface)]"
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
              whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              style={{ borderWidth: '1px' }}
            >
              <h3 className="text-2xl font-semibold mb-4 text-[var(--mk-ink)]">{plan.name}</h3>
              <ul className="space-y-3 text-left">
                {plan.bullets.map((bullet, i) => (
                  <li key={i} className="text-sm text-[var(--mk-ink-2)] flex items-start">
                    <span className="mr-3 text-[var(--mk-hairline)]">—</span>
                    {bullet}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/signup"
            className="px-8 py-4 bg-[var(--mk-ink)] text-[var(--mk-bg)] rounded-lg hover:opacity-90 transition-opacity text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--mk-ink)] focus:ring-offset-2"
          >
            {landingCopy.pricingTeaser.secondaryCta}
          </Link>
        </div>
      </div>
    </section>
  );
}
