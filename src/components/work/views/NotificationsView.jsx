import Notifications from '../../../pages/Notifications';

/**
 * Notifications View Component
 * Embeds Notifications in Work hub
 */
export default function NotificationsView() {
  return (
    <div className="py-2">
      <Notifications embedded />
    </div>
  );
}
