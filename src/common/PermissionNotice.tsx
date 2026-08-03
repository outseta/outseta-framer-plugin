import { Alert } from "./Alert";

export function PermissionNotice({ action }: { action: string }) {
  return (
    <Alert level="warning">
      You don&apos;t have permission to {action} in this Framer project.
    </Alert>
  );
}
