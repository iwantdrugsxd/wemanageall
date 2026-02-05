import Panel from '../layout/Panel';
import { cn } from '../../lib/cn';

/**
 * KPI Strip Component
 * Compact stat cards showing key metrics
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
      subValue: `${progressPercentage}%`,
      color: 'var(--text-primary)'
    },
    {
      label: 'Planned',
      value: formatTime(totalTimeEstimated),
      subValue: null,
      color: 'var(--text-primary)'
    },
    {
      label: 'Spent',
      value: formatTime(totalTimeSpent),
      subValue: null,
      color: 'var(--text-primary)'
    },
    {
      label: 'Upcoming',
      value: upcomingEventsCount.toString(),
      subValue: 'events',
      color: 'var(--text-primary)'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {kpis.map((kpi, index) => (
        <Panel key={index} className="p-3">
          <div className="text-xs font-medium mb-1 transition-colors" style={{ color: 'var(--text-muted)' }}>
            {kpi.label}
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-lg font-medium transition-colors" style={{ color: kpi.color }}>
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
