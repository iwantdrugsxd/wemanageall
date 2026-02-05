import Calendar from '../../../pages/Calendar';

/**
 * Calendar View Component
 * Embeds Calendar in Work hub
 */
export default function CalendarView() {
  return (
    <div className="py-2">
      <Calendar embedded />
    </div>
  );
}
