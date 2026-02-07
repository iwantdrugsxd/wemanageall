import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';

const PLANS = {
  free: {
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
    for: '',
    cta: 'Current Plan',
    ctaLink: '/signup',
    isCurrent: true,
    highlights: [
      '3 Projects',
      '50 Calendar Events',
      'Community Support'
    ]
  },
  starter: {
    name: 'Starter',
    monthlyPrice: 199,
    annualPrice: 199,
    for: '',
    cta: 'Start 7-Day Trial',
    ctaLink: '/signup',
    highlights: [
      'Unlimited Projects',
      'Unlimited Calendar Events',
      'Advanced Analytics',
      'Email Support'
    ]
  },
  team: {
    name: 'Team',
    monthlyPrice: 499,
    annualPrice: 499,
    for: '',
    cta: 'Start 7-Day Trial',
    ctaLink: '/signup',
    isPopular: true,
    hasSeatsInput: true,
    highlights: [
      'Unlimited Projects',
      'Unlimited Calendar Events',
      'Up to 25 Team Members',
      'Advanced Analytics',
      'Integrations',
      'Priority Support'
    ]
  }
};

export default function PricingSection() {
  const shouldReduceMotion = useReducedMotion();
  const [teamSeats, setTeamSeats] = useState(2);
  
  const formatPrice = (price) => {
    if (price === 0) return 'Free';
    return `₹${price}`;
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
            Choose your plan
          </h2>
          <p className="mk-lead text-[var(--mk-ink-2)] max-w-2xl mx-auto">
            Select the plan that works best for you. Upgrade or downgrade anytime.
          </p>
        </motion.div>

        {/* Plan Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {Object.entries(PLANS).map(([key, plan], index) => {
            const price = plan.monthlyPrice;
            
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
                      {key === 'team' ? '/user/month' : '/month'}
                    </span>
                  )}
                </div>

                {/* Highlights */}
                <ul className="space-y-3 mb-6">
                  {plan.highlights.map((highlight, i) => (
                    <li key={i} className="text-sm text-[var(--mk-ink-2)] flex items-start">
                      <svg className="mr-3 mt-0.5 flex-shrink-0 w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {highlight}
                    </li>
                  ))}
                </ul>

                {/* Number of Seats Input (Team Plan) */}
                {plan.hasSeatsInput && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-[var(--mk-ink-2)] mb-2">
                      Number of Seats
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="25"
                      value={teamSeats}
                      onChange={(e) => setTeamSeats(parseInt(e.target.value) || 1)}
                      className="w-full px-4 py-2 border mk-hairline rounded-lg bg-[var(--mk-bg)] text-[var(--mk-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--mk-ink)] focus:ring-offset-2"
                      style={{ borderWidth: '1px' }}
                    />
                  </div>
                )}

                {/* CTA Buttons */}
                {plan.isCurrent ? (
                  <button
                    disabled
                    className="block w-full text-center px-6 py-3 rounded-lg text-sm font-medium bg-gray-200 text-gray-500 cursor-not-allowed"
                  >
                    {plan.cta}
                  </button>
                ) : (
                  <div className="space-y-3">
                    <Link
                      to={plan.ctaLink}
                      className="block w-full text-center px-6 py-3 rounded-lg text-sm font-medium bg-orange-500 text-white hover:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                    >
                      {plan.cta}
                    </Link>
                    <Link
                      to={plan.ctaLink}
                      className="block w-full text-center px-6 py-3 rounded-lg text-sm font-medium bg-blue-900 text-white hover:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-900 focus:ring-offset-2"
                    >
                      Subscribe
                    </Link>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
