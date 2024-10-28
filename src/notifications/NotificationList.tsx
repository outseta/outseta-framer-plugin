import classes from "./Notification.module.css";

export function NotificationList({ children }: { children: React.ReactNode }) {
  return <ul className={classes.list}>{children}</ul>;
}
