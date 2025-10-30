export type AuthCallbackConfig =
  | { mode: "default" }
  | { mode: "current" }
  | { mode: "page"; path: string }
  | { mode: "custom"; url: string };

// Convert config to a JavaScript expression suitable for the script generator.
export const authCallbackConfigToExpression = (
  config: AuthCallbackConfig,
): string => {
  switch (config.mode) {
    case "default":
      return `undefined`;
    case "current":
      return `window.location.href`;
    case "page":
      return `new URL("${config.path}", window.location.origin).href`;
    case "custom":
      return JSON.stringify(config.url);
    default:
      return `undefined`;
  }
};

// Convert a parsed JavaScript expression back to a config object.
export const authCallbackExpressionToMode = (
  expression: string,
): AuthCallbackConfig => {
  expression = expression.trim();

  if (expression === "") {
    return { mode: "default" };
  }

  // Current Mode
  if (expression === "window.location.href") {
    return { mode: "current" };
  }

  // Page Mode: new URL("/path", window.location.origin).href
  const pageMatch = expression.match(
    /^new\s+URL\s*\(\s*"([^"]+)"\s*,\s*window\.location\.origin\s*\)\s*\.href$/,
  );
  const path = pageMatch?.[1]?.trim();
  if (path) {
    return { mode: "page", path };
  }

  // Custom Mode: quoted absolute or relative URL
  const customMatch = expression.match(/^['"]([^'"]+)['"]$/);
  const url = customMatch?.[1]?.trim();
  if (url) {
    return { mode: "custom", url };
  }

  // Fallback to default mode
  return { mode: "default" };
};
