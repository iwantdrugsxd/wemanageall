import Panel from '../layout/Panel';

/**
 * KPI Strip Component
 * Compact stat cards showing key metrics for today. Each metric gets a
 * consistent color meaning (see index.css tokens) so a half-second glance
 * tells you "good" vs "needs attention" before you've even read a number -
 * color-as-signal is faster for the brain to process than text.
 */
export default function KpiStrip({
  completedTasks,
  totalTasks,
  progressPercentage,
  totalTimeEstimated,
  totalTimeSpent,
  upcomingEventsCount
}) {
  const formatTime = (minutes) => {
    if (!minutes) return '0h';
    const hours = Math.floor(minutes / 60);
    return `${hours}h`;
  };

  const kpis = [
    {
      label: 'Objectives',
      value: `${completedTasks}/${totalTasks}`,
      subValue: totalTasks > 0 ? `${progressPercentage}% done` : 'none yet',
      accent: 'var(--growth)',
      accentSoft: 'var(--growth-soft)',
      icon: 'M5 13l4 4L19 7'
    },
    {
      label: 'Planned',
      value: formatTime(totalTimeEstimated),
      subValue: 'estimated',
      accent: 'var(--focus-color)',
      accentSoft: 'var(--focus-soft)',
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    {
      label: 'Spent',
      value: formatTime(totalTimeSpent),
      subValue: 'so far today',
      accent: 'var(--accent)',
      accentSoft: 'var(--accent-soft)',
      icon: 'M13 10V3L4 14h7v7l9-11h-7z'
    },
    {
      label: 'Upcoming',
      value: upcomingEventsCount.toString(),
      subValue: upcomingEventsCount === 1 ? 'event' : 'events',
      accent: 'var(--text-secondary)',
      accentSoft: 'var(--bg-surface)',
      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {kpis.map((kpi, index) => (
        <Panel key={index} className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="text-label">
              {kpi.label}
            </div>
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: kpi.accentSoft, color: kpi.accent }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={kpi.icon} />
              </svg>
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <div className="text-xl font-semibold tracking-tight transition-colors" style={{ color: 'var(--text-primary)' }}>
              {kpi.value}
            </div>
            {kpi.subValue && (
              <div className="text-xs transition-colors" style={{ color: 'var(--text-muted)' }}>
                {kpi.subValue}
              </div>
            )}
          </div>
        </Panel>
      ))}
    </div>
  );
}
