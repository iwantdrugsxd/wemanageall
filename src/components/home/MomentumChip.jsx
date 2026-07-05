import { useEffect, useState } from 'react';

/**
 * MomentumChip - habit-formation feature.
 *
 * Shows a simple, honest streak of days the person has "shown up" (set an
 * intention or written a reflection), plus a 14-day dot history. This
 * leans on well-established behavior-change mechanics:
 *  - small, visible wins compound motivation (variable-reward research,
 *    but kept truthful - no inflated counters)
 *  - loss-aversion: once a streak exists, people work to protect it
 *  - a short history strip (like GitHub's contribution graph) turns an
 *    abstract habit into something concrete you can see building
 *
 * Deliberately understated: a warm sage color and a small flame icon,
 * not a loud badge - the reward should feel earned, not gamified-loud.
 */
export default function MomentumChip() {
  const [momentum, setMomentum] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/today/momentum', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) setMomentum(data);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  if (!momentum || momentum.streak === 0) {
    return (
      <span className="streak-chip" style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-muted)' }}>
        <span>Start a streak today</span>
      </span>
    );
  }

  return (
    <div className="group relative inline-flex">
      <span className="streak-chip" title="Days in a row you've set an intention or reflected">
        <svg className="w-3.5 h-3.5 streak-flame" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
        </svg>
        <span>{momentum.streak}-day streak</span>
      </span>

      {/* History strip - appears on hover/focus so it doesn't add visual weight by default */}
      <div
        className="absolute left-0 top-full mt-2 hidden group-hover:flex items-center gap-1 p-2 rounded-xl border shadow-calm-md z-10 whitespace-nowrap"
        style={{ backgroundColor: 'var(--bg-modal)', borderColor: 'var(--border-subtle)' }}
      >
        {momentum.history.map((day) => (
          <span
            key={day.date}
            title={day.date}
            className="w-2.5 h-2.5 rounded-[3px]"
            style={{ backgroundColor: day.active ? 'var(--growth)' : 'var(--border-subtle)' }}
          />
        ))}
      </div>
    </div>
  );
}
