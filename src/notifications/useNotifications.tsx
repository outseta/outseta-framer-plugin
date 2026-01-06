import { useMutation } from "@tanstack/react-query";
import { Button } from "@triozer/framer-toolbox";
import { useConfiguration, useCustomCode, setCustomCode } from "../custom-code";
import { Link } from "@tanstack/react-router";

export enum NotificationLevel {
  INFO = 1,
  WARNING,
  ERROR,
}

export type Notification = {
  level: NotificationLevel;
  message: React.ReactNode;
};

export const useNotifications = () => {
  const { domain, isInvalid, disabled } = useConfiguration();
  const { needsUpdate, config } = useCustomCode();

  const updateMutation = useMutation({
    mutationFn: setCustomCode,
  });

  const notifications = [];

  if (isInvalid) {
    notifications.push({
      level: NotificationLevel.ERROR,
      message: (
        <>
          The Outseta domain configured does not exist, either create an account
          for <strong>{domain}</strong> or{" "}
          <Link to="/custom-code">edit the configured Outseta domain</Link>.
        </>
      ),
    });
  }

  if (disabled) {
    notifications.push({
      level: NotificationLevel.WARNING,
      message: (
        <>
          Please reenable the custom plugin code for Outseta to work properly.
          Go to{" "}
          <em>
            {
              "Site Settings > General > Custom Code > Custom Plugin Code > Outseta"
            }
          </em>
          .
        </>
      ),
    });
  }

  if (needsUpdate) {
    notifications.push({
      level: NotificationLevel.WARNING,
      message: (
        <>
          The Outseta script in your Framer site is outdated and doesn't match
          the current plugin version.{" "}
          <Button
            variant="primary"
            onClick={(e) => {
              e.preventDefault();
              updateMutation.mutate(config);
            }}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? "Updating..." : "Update Script"}
          </Button>
        </>
      ),
    });
  }

  const warnings = notifications.filter(
    ({ level }) => level === NotificationLevel.WARNING,
  );

  const errors = notifications.filter(
    ({ level }) => level === NotificationLevel.ERROR,
  );

  return { all: notifications, warnings, errors };
};
