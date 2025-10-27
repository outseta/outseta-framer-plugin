export type AuthCallbackConfig =
  | { mode: "default" }
  | { mode: "current" }
  | { mode: "page"; path: string }
  | { mode: "custom"; path: string };

// Helper: Convert auth callback config to JavaScript expression
export const authCallbackConfigToExpression = (
  config: AuthCallbackConfig,
): string | undefined => {
  switch (config.mode) {
    case "default":
      return undefined;
    case "current":
      return "window.location.href";
    case "page":
      return `new URL("${config.path}", window.location.origin).href`;
    case "custom":
      return `"${config.path}"`;
  }
};

// Helper: Convert JavaScript expression back to auth callback config
export const authCallbackExpressionToMode = (
  expression: string | undefined,
): AuthCallbackConfig => {
  if (!expression) {
    return { mode: "default" };
  }

  // Current Mode
  if (expression === "window.location.href") {
    return { mode: "current" };
  }

  // Page Mode
  const pageMatch = expression.match(
    /^new\s+URL\s*\(\s*"([^"]+)"\s*,\s*window\.location\.origin\s*\)\s*\.href$/,
  );
  if (pageMatch) {
    return { mode: "page", path: pageMatch[1] };
  }

  // Custom Mode
  const customMatch = expression.match(/^["']([^"']+)["']$/);
  if (customMatch) {
    return { mode: "custom", path: customMatch[1] };
  }

  // Fallback to default mode
  return { mode: "default" };
};
