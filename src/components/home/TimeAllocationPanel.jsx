import Panel from '../layout/Panel';

/**
 * Time Allocation Panel Component
 * Displays pie chart of time allocation across tasks
 */
export default function TimeAllocationPanel({ pieChartData, totalTimeEstimated }) {
  return (
    <Panel title="Time Allocation">
      {pieChartData.length > 0 ? (
        <div className="space-y-4">
          {/* Pie Chart */}
          <div className="flex items-center justify-center">
            <div className="relative w-48 h-48">
              <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 192 192">
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                />
                {(() => {
                  let currentAngle = 0;
                  const radius = 80;
                  const circumference = 2 * Math.PI * radius;
                  return pieChartData.map((item, index) => {
                    const percentage = (item.minutes / totalTimeEstimated);
                    const angle = percentage * 360;
                    const dashLength = (circumference * percentage);
                    const gapLength = circumference - dashLength;
                    const offset = currentAngle * (circumference / 360);
                    currentAngle += angle;
                    return (
                      <circle
                        key={index}
                        cx="96"
                        cy="96"
                        r={radius}
                        fill="none"
                        stroke={item.color}
                        strokeWidth="12"
                        strokeDasharray={`${dashLength} ${gapLength}`}
                        strokeDashoffset={-offset}
                        strokeLinecap="round"
                      />
                    );
                  });
                })()}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-medium transition-colors" style={{ color: 'var(--text-primary)' }}>
                    {Math.round(totalTimeEstimated / 60 * 10) / 10}h
                  </div>
                  <div className="text-xs transition-colors" style={{ color: 'var(--text-muted)' }}>Total</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Legend */}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {pieChartData.map((item, index) => {
              const percentage = ((item.minutes / totalTimeEstimated) * 100).toFixed(1);
              return (
                <div key={index} className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="truncate transition-colors" style={{ color: 'var(--text-primary)' }} title={item.fullName}>
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="transition-colors" style={{ color: 'var(--text-muted)' }}>{item.value}h</span>
                    <span className="transition-colors" style={{ color: 'var(--text-muted)' }}>({percentage}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="relative w-32 h-32 mx-auto mb-4">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="8"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm transition-colors" style={{ color: 'var(--text-muted)' }}>0%</span>
            </div>
          </div>
          <p className="text-xs transition-colors" style={{ color: 'var(--text-muted)' }}>Add time estimates to tasks to see allocation</p>
        </div>
      )}
    </Panel>
  );
}
