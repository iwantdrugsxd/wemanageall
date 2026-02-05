import { useState, useEffect } from 'react';

/**
 * Home Header Component
 * Displays greeting, current date, and time
 */
export default function HomeHeader({ user }) {
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    // Update time and date
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      setCurrentTime(timeString);
      
      const dateString = now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
      }).toUpperCase();
      setCurrentDate(dateString);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-light transition-colors mb-2" style={{ color: 'var(--text-primary)' }}>
            {greeting}, {firstName}
          </h1>
          <p className="text-sm transition-colors" style={{ color: 'var(--text-muted)' }}>
            {currentDate}
          </p>
        </div>
        {/* Quick Add placeholder - can be enhanced later */}
        <button
          className="px-4 py-2 rounded-lg text-sm transition-colors border"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-subtle)',
            color: 'var(--text-primary)'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'var(--bg-surface)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'var(--bg-card)';
          }}
        >
          Quick Add
        </button>
      </div>
    </div>
  );
}
