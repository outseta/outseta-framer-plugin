export type AuthCallbackConfig =
  | { mode: "default" }
  | { mode: "current" }
  | { mode: "page"; path: string }
  | { mode: "custom"; path: string };

// Helper: Convert auth callback config to JavaScript expression
export const authCallbackModeToUrlExpression = (
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
export const authCallbackUrlExpressionToMode = (
  expression: string | undefined,
): AuthCallbackConfig => {
  if (!expression) {
    return { mode: "default" };
  }

  if (expression === "window.location.href") {
    return { mode: "current" };
  }

  const pageMatch = expression.match(
    /^new URL\("([^"]+)",\s*window\.location\.origin\)\.href$/,
  );
  if (pageMatch) {
    return { mode: "page", path: pageMatch[1] };
  }

  const customMatch = expression.match(/^"([^"]+)"$/);
  if (customMatch) {
    return { mode: "custom", path: customMatch[1] };
  }

  // Log unexpected URL expression format to Rollbar
  console.error(
    `Unexpected auth callback URL expression format: ${expression}`,
  );

  // Fallback to default if we can't parse it
  return { mode: "default" };
};
