import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const FAQ_ITEMS = [
  {
    question: 'Can I change plans later?',
    answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate any charges.'
  },
  {
    question: 'Is there a free trial?',
    answer: 'The Free plan is available forever with no credit card required. Team and Business plans start with a 14-day trial period.'
  },
  {
    question: 'Do I need a credit card?',
    answer: 'No credit card is required for the Free plan. Team and Business plans require a credit card to start the trial, but you can cancel anytime during the trial period.'
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Yes, you can cancel your subscription at any time. Your access will continue until the end of your current billing period.'
  },
  {
    question: 'Do you offer invoices for Business?',
    answer: 'Yes, Business plan customers receive invoices and can pay via invoice. Contact sales for annual contracts and custom billing arrangements.'
  }
];

export default function PricingFaq() {
  const shouldReduceMotion = useReducedMotion();
  const [openIndex, setOpenIndex] = useState(null);
  
  const toggleItem = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  
  return (
    <div className="max-w-3xl mx-auto px-6 lg:px-10 mb-16">
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
        whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h3 className="text-2xl font-semibold mb-8 text-center text-[var(--mk-ink)]">
          Frequently asked questions
        </h3>
        
        <div className="space-y-2">
          {FAQ_ITEMS.map((item, index) => (
            <motion.details
              key={index}
              open={openIndex === index}
              className="group"
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
              whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <summary
                onClick={(e) => {
                  e.preventDefault();
                  toggleItem(index);
                }}
                className="list-none cursor-pointer py-4 px-6 rounded-lg bg-[var(--mk-surface)] border mk-hairline hover:border-[var(--mk-ink)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--mk-ink)] focus:ring-offset-2"
                style={{ borderWidth: '1px' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleItem(index);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-expanded={openIndex === index}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[var(--mk-ink)] pr-4">
                    {item.question}
                  </span>
                  <span className="text-[var(--mk-ink-2)] text-lg flex-shrink-0">
                    {openIndex === index ? '−' : '+'}
                  </span>
                </div>
              </summary>
              
              <div
                className="overflow-hidden transition-all duration-300"
                style={{
                  maxHeight: openIndex === index ? '500px' : '0',
                  opacity: openIndex === index ? 1 : 0
                }}
              >
                <div className="px-6 pb-4 pt-2">
                  <p className="text-sm text-[var(--mk-ink-2)] leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </div>
            </motion.details>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
