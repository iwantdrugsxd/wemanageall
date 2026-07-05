import { useState } from 'react';
import PageHeader from '../layout/PageHeader';
import Button from '../ui/Button';
import MomentumChip from './MomentumChip';
import { cn } from '../../lib/cn';

/**
 * Today Header Component
 * Enterprise header with greeting, date, time pill, and Quick Add menu
 */
export default function TodayHeader({
  greeting,
  currentDate,
  currentTime,
  onQuickAddIntention,
  onQuickAddTask,
  onQuickAddEvent,
  onQuickAddThought,
  onEnterFocusMode
}) {
  const [showQuickAddMenu, setShowQuickAddMenu] = useState(false);

  return (
    <PageHeader
      title="Today"
      subtitle={
        <div className="flex items-center gap-3">
          <span>{greeting}</span>
          <span className="text-xs">•</span>
          <span>{currentDate}</span>
          {currentTime && (
            <>
              <span className="text-xs">•</span>
              <span 
                className="px-2 py-0.5 rounded-md text-xs font-medium"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-primary)'
                }}
              >
                {currentTime}
              </span>
            </>
          )}
        </div>
      }
      actions={
        <div className="flex items-center gap-3">
          <MomentumChip />
          {onEnterFocusMode && (
            <Button variant="ghost" size="sm" onClick={onEnterFocusMode} title="Enter focus mode - hide everything but your next task">
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V6a2 2 0 012-2h2M4 16v2a2 2 0 002 2h2m8-16h2a2 2 0 012 2v2m-4 12h2a2 2 0 002-2v-2" />
              </svg>
              Focus
            </Button>
          )}
        <div className="relative">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowQuickAddMenu(!showQuickAddMenu)}
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Quick Add
          </Button>

          {showQuickAddMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowQuickAddMenu(false)}
              />
              <div
                className="absolute right-0 mt-2 w-56 rounded-2xl shadow-calm-lg py-2 z-20 border"
                style={{
                  backgroundColor: 'var(--bg-modal)',
                  borderColor: 'var(--border-subtle)'
                }}
              >
                <button
                  onClick={() => {
                    onQuickAddIntention();
                    setShowQuickAddMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm transition-colors hover:bg-[var(--bg-surface)]"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Add intention
                </button>
                <button
                  onClick={() => {
                    onQuickAddTask();
                    setShowQuickAddMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm transition-colors hover:bg-[var(--bg-surface)]"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Add objective
                </button>
                <button
                  onClick={() => {
                    onQuickAddEvent();
                    setShowQuickAddMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm transition-colors hover:bg-[var(--bg-surface)]"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Add event
                </button>
                <button
                  onClick={() => {
                    onQuickAddThought();
                    setShowQuickAddMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm transition-colors hover:bg-[var(--bg-surface)]"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Start writing
                </button>
              </div>
            </>
          )}
        </div>
        </div>
      }
    />
  );
}
