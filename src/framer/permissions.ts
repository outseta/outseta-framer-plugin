import { framer, type ProtectedMethod } from "framer-plugin";

export function requireFramerPermission(
  method: ProtectedMethod,
  action: string,
) {
  if (!framer.isAllowedTo(method)) {
    throw new Error(
      `You don't have permission to ${action} in this Framer project.`,
    );
  }
}

export function notifyMutationError(action: string) {
  return (error: Error) => {
    console.error(`Failed to ${action}`, error);
    framer.notify(`Could not ${action}: ${error.message}`, {
      variant: "error",
    });
  };
}
