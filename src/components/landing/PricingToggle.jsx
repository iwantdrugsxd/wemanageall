import { useState } from 'react';

export default function PricingToggle({ value, onChange }) {
  return (
    <div className="flex items-center justify-center gap-4 mb-12">
      <span
        className={`text-sm font-medium transition-colors ${
          value === 'monthly' ? 'text-[var(--mk-ink)]' : 'text-[var(--mk-ink-2)]'
        }`}
      >
        Monthly
      </span>
      
      <button
        type="button"
        role="switch"
        aria-checked={value === 'annual'}
        aria-label="Toggle between monthly and annual pricing"
        onClick={() => onChange(value === 'monthly' ? 'annual' : 'monthly')}
        className="relative inline-flex h-8 w-14 items-center rounded-full bg-[var(--mk-hairline)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--mk-ink)] focus:ring-offset-2"
        style={{ borderWidth: '1px', borderColor: 'var(--mk-hairline)' }}
      >
        <span
          className={`inline-block h-6 w-6 transform rounded-full bg-[var(--mk-ink)] transition-transform ${
            value === 'annual' ? 'translate-x-7' : 'translate-x-1'
          }`}
        />
      </button>
      
      <div className="flex items-center gap-2">
        <span
          className={`text-sm font-medium transition-colors ${
            value === 'annual' ? 'text-[var(--mk-ink)]' : 'text-[var(--mk-ink-2)]'
          }`}
        >
          Annual
        </span>
        {value === 'annual' && (
          <span className="px-2 py-0.5 text-xs uppercase tracking-wider bg-[var(--mk-accent)]/10 text-[var(--mk-accent)] rounded font-semibold">
            Save ~15%
          </span>
        )}
      </div>
    </div>
  );
}
