/**
 * Upgrade Gate Component
 * Soft paywall banner - visual only, does not block functionality
 */
import { Link } from 'react-router-dom';

export default function UpgradeGate({ message, ctaText = "Upgrade Now" }) {
  return (
    <div 
      className="mb-6 p-4 rounded-lg border transition-colors"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-subtle)'
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            <svg className="w-5 h-5" style={{ color: 'var(--bg-base)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium transition-colors" style={{ color: 'var(--text-primary)' }}>
              {message || "Unlock more features with a paid plan"}
            </p>
            <p className="text-xs transition-colors mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Get unlimited projects, team collaboration, and more
            </p>
          </div>
        </div>
        <Link
          to="/pricing"
          className="px-4 py-2 rounded-lg text-sm transition-colors flex-shrink-0"
          style={{
            backgroundColor: 'var(--accent)',
            color: 'var(--bg-base)'
          }}
        >
          {ctaText}
        </Link>
      </div>
    </div>
  );
}
