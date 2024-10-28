import { NotificationLevel, type Notification } from "./useNotifications";

import classes from "./Notification.module.css";

export function NotificationItem({ message, level }: Notification) {
  return (
    <li className={classes.item} data-level={NotificationLevel[level]}>
      {message}
    </li>
  );
}
