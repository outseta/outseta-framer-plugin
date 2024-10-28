import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "../common";
import {
  NotificationList,
  NotificationItem,
  useNotifications,
} from "../notifications";

export const Route = createFileRoute("/notifications")({
  component: Messages,
});

function Messages() {
  const { all } = useNotifications();

  return (
    <>
      <PageHeader title="Notifications" />

      <main>
        <NotificationList>
          {all.map((notification) => (
            <NotificationItem {...notification} />
          ))}
        </NotificationList>
      </main>
    </>
  );
}
