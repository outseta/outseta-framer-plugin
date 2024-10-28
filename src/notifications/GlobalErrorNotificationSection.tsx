import { NotificationItem } from "./NotificationItem";
import { NotificationList } from "./NotificationList";
import { useNotifications } from "./useNotifications";

export function GlobalErrorNotificationSection() {
  const { errors } = useNotifications();
  if (errors.length < 1) return null;
  return (
    <NotificationList>
      {errors.map((notification) => (
        <NotificationItem {...notification} />
      ))}
    </NotificationList>
  );
}
