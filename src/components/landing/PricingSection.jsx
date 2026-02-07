import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import PricingToggle from './PricingToggle';

const PLANS = {
  free: {
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
    for: 'Solo founders validating an idea',
    cta: 'Start free',
    ctaLink: '/signup',
    highlights: [
      'Core modules: Projects, Work, Docs, Calendar',
      'Basic storage',
      'Personal workspace'
    ]
  },
  team: {
    name: 'Team',
    monthlyPrice: 12,
    annualPrice: 10,
    for: 'Small teams shipping weekly',
    cta: 'Start Team trial',
    ctaLink: '/signup',
    isPopular: true,
    highlights: [
      'Unlimited projects',
      'Shared workspace + collaboration',
      'Advanced views and templates'
    ]
  },
  business: {
    name: 'Business',
    monthlyPrice: 24,
    annualPrice: 20,
    for: 'Teams needing controls',
    cta: 'Contact sales',
    ctaLink: 'mailto:hello@wemanageall.in?subject=Business%20plan',
    highlights: [
      'Role-based access',
      'Audit-ready activity',
      'Priority support + invoices'
    ]
  }
};

export default function PricingSection() {
  const shouldReduceMotion = useReducedMotion();
  const [billingCycle, setBillingCycle] = useState('monthly');
  
  const formatPrice = (price) => {
    if (price === 0) return '$0';
    return `$${price}`;
  };
  
  return (
    <section id="pricing" className="mk-section bg-[var(--mk-bg)]">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Section Title */}
        <motion.div
          className="text-center mb-12"
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 30 }}
          whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="mk-h1 mb-4 text-[var(--mk-ink)]">
            Simple plans that scale with your team.
          </h2>
          <p className="mk-lead text-[var(--mk-ink-2)] max-w-2xl mx-auto">
            Choose the plan that fits your workflow. Upgrade or downgrade anytime.
          </p>
        </motion.div>

        {/* Billing Toggle */}
        <PricingToggle value={billingCycle} onChange={setBillingCycle} />

        {/* Plan Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {Object.entries(PLANS).map(([key, plan], index) => {
            const price = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
            const isExternal = plan.ctaLink.startsWith('mailto:');
            
            return (
              <motion.div
                key={key}
                className={`relative p-8 rounded-lg mk-hairline bg-[var(--mk-surface)] ${
                  plan.isPopular
                    ? 'border-2 border-[var(--mk-ink)] bg-[var(--mk-surface)]/50'
                    : ''
                }`}
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
                whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                style={{ borderWidth: plan.isPopular ? '2px' : '1px' }}
              >
                {/* Popular Badge */}
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 text-xs uppercase tracking-wider bg-[var(--mk-ink)] text-[var(--mk-bg)] rounded-full font-semibold">
                      Most popular
                    </span>
                  </div>
                )}

                {/* Plan Name */}
                <h3 className="text-2xl font-semibold mb-2 text-[var(--mk-ink)]">
                  {plan.name}
                </h3>

                {/* Price */}
                <div className="mb-4">
                  <span className="text-4xl font-bold text-[var(--mk-ink)]">
                    {formatPrice(price)}
                  </span>
                  {price > 0 && (
                    <span className="text-sm text-[var(--mk-ink-2)] ml-2">
                      / seat / {billingCycle === 'annual' ? 'month' : 'month'}
                    </span>
                  )}
                  {price > 0 && billingCycle === 'annual' && (
                    <div className="text-xs text-[var(--mk-ink-2)] mt-1">
                      Billed annually
                    </div>
                  )}
                </div>

                {/* For */}
                <p className="text-sm text-[var(--mk-ink-2)] mb-6">
                  {plan.for}
                </p>

                {/* Highlights */}
                <ul className="space-y-3 mb-8">
                  {plan.highlights.map((highlight, i) => (
                    <li key={i} className="text-sm text-[var(--mk-ink-2)] flex items-start">
                      <span className="mr-3 text-[var(--mk-hairline)] font-bold">—</span>
                      {highlight}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {isExternal ? (
                  <a
                    href={plan.ctaLink}
                    className={`block w-full text-center px-6 py-3 rounded-lg text-sm font-medium transition-opacity focus:outline-none focus:ring-2 focus:ring-[var(--mk-ink)] focus:ring-offset-2 ${
                      plan.isPopular
                        ? 'bg-[var(--mk-ink)] text-[var(--mk-bg)] hover:opacity-90'
                        : 'bg-[var(--mk-surface)] border mk-hairline text-[var(--mk-ink)] hover:border-[var(--mk-ink)]'
                    }`}
                    style={{ borderWidth: plan.isPopular ? '0' : '1px' }}
                  >
                    {plan.cta}
                  </a>
                ) : (
                  <Link
                    to={plan.ctaLink}
                    className={`block w-full text-center px-6 py-3 rounded-lg text-sm font-medium transition-opacity focus:outline-none focus:ring-2 focus:ring-[var(--mk-ink)] focus:ring-offset-2 ${
                      plan.isPopular
                        ? 'bg-[var(--mk-ink)] text-[var(--mk-bg)] hover:opacity-90'
                        : 'bg-[var(--mk-surface)] border mk-hairline text-[var(--mk-ink)] hover:border-[var(--mk-ink)]'
                    }`}
                    style={{ borderWidth: plan.isPopular ? '0' : '1px' }}
                  >
                    {plan.cta}
                  </Link>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
