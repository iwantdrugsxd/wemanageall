import { motion, useReducedMotion } from 'framer-motion';

const FEATURES = [
  { name: 'Projects', free: 'Limited', team: 'Unlimited', business: 'Unlimited' },
  { name: 'Board/List/Timeline/Notes', free: '✓', team: '✓', business: '✓' },
  { name: 'Calendar blocks', free: '✓', team: '✓', business: '✓' },
  { name: 'Resources + Lists', free: 'Basic', team: 'Unlimited', business: 'Unlimited' },
  { name: 'Collaboration', free: '—', team: '✓', business: '✓' },
  { name: 'Permissions', free: '—', team: 'Basic', business: 'Advanced' },
  { name: 'Audit log', free: '—', team: '—', business: '✓' },
  { name: 'Priority support', free: '—', team: '—', business: '✓' }
];

export default function PricingCompare() {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <div className="max-w-5xl mx-auto px-6 lg:px-10 mb-16">
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
        whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h3 className="text-2xl font-semibold mb-8 text-center text-[var(--mk-ink)]">
          Feature comparison
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b mk-hairline" style={{ borderWidth: '1px' }}>
                <th className="text-left py-4 px-4 text-sm font-semibold text-[var(--mk-ink-2)] uppercase tracking-wider">
                  Feature
                </th>
                <th className="text-center py-4 px-4 text-sm font-semibold text-[var(--mk-ink-2)] uppercase tracking-wider">
                  Free
                </th>
                <th className="text-center py-4 px-4 text-sm font-semibold text-[var(--mk-ink-2)] uppercase tracking-wider">
                  Team
                </th>
                <th className="text-center py-4 px-4 text-sm font-semibold text-[var(--mk-ink-2)] uppercase tracking-wider">
                  Business
                </th>
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((feature, index) => (
                <motion.tr
                  key={feature.name}
                  className="border-b mk-hairline"
                  style={{ borderWidth: '1px' }}
                  initial={shouldReduceMotion ? {} : { opacity: 0, x: -20 }}
                  whileInView={shouldReduceMotion ? {} : { opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <td className="py-4 px-4 text-sm font-medium text-[var(--mk-ink)]">
                    {feature.name}
                  </td>
                  <td className="py-4 px-4 text-sm text-center text-[var(--mk-ink-2)]">
                    {feature.free}
                  </td>
                  <td className="py-4 px-4 text-sm text-center text-[var(--mk-ink-2)]">
                    {feature.team}
                  </td>
                  <td className="py-4 px-4 text-sm text-center text-[var(--mk-ink-2)]">
                    {feature.business}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
