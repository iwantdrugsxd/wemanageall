import { useEffect, useState } from 'react';

/**
 * FocusModeOverlay - distraction-reduction feature.
 *
 * The rest of Home shows everything at once (intention, tasks, reflection,
 * calendar, insights, notes) which is useful for planning but is a lot of
 * simultaneous choice when you actually need to *do* something. Focus Mode
 * strips all of that away to a single screen: today's one thing, and the
 * next task to finish. Removing options - not adding features - is what
 * lowers cognitive load here.
 *
 * Design choices grounded in attention/psychology research:
 *  - Near-solid, low-contrast background removes peripheral visual noise.
 *  - Only one action is available at a time (finish this task) so there's
 *    no decision about what to do next while focused.
 *  - A quiet elapsed-time readout (not a countdown/pressure timer) supports
 *    calm sustained attention instead of urgency-driven stress.
 */
export default function FocusModeOverlay({ open, onClose, intention, tasks = [], onToggleTask }) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!open) {
      setElapsedSeconds(0);
      return;
    }
    const interval = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const activeTask = tasks.find((t) => t.status === 'pending' || t.status === 'todo');
  const minutes = Math.floor(elapsedSeconds / 60).toString().padStart(2, '0');
  const seconds = (elapsedSeconds % 60).toString().padStart(2, '0');

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center focus-mode-scrim animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Focus mode"
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 px-3 py-2 rounded-xl text-sm transition-colors"
        style={{ color: 'var(--text-muted)' }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-surface)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
      >
        Exit focus <span className="opacity-60 ml-1">esc</span>
      </button>

      <div className="w-full max-w-lg px-6 text-center animate-[rise_0.4s_ease-out]">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-8 tint-focus"
          style={{ color: 'var(--focus-color)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--focus-color)' }} />
          Focus mode &middot; {minutes}:{seconds}
        </div>

        {intention ? (
          <p className="text-sm mb-3 transition-colors" style={{ color: 'var(--text-muted)' }}>
            Today's one thing: <span style={{ color: 'var(--text-secondary)' }}>{intention}</span>
          </p>
        ) : null}

        {activeTask ? (
          <>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-8 transition-colors" style={{ color: 'var(--text-primary)' }}>
              {activeTask.title}
            </h2>
            <button
              onClick={() => onToggleTask(activeTask.id, true)}
              className="btn-primary reward-pop"
            >
              Mark done
            </button>
          </>
        ) : (
          <h2 className="text-xl font-medium mb-2 transition-colors" style={{ color: 'var(--text-primary)' }}>
            Nothing queued - enjoy the quiet, or add one thing to work on.
          </h2>
        )}
      </div>
    </div>
  );
}
