export type PostSignupConfig =
  | { mode: "default" }
  | { mode: "message" }
  | { mode: "page"; path: string }
  | { mode: "custom"; url: string };

// Convert config to a JavaScript expression suitable for the script generator.
// Returns:
// - null to omit the line (default)
// - 'undefined' to force embed message
// - 'new URL("/path", window.location.origin).href' for page
// - '"https://..."' for custom
export const postSignupConfigToExpression = (
  config: PostSignupConfig,
): string | null => {
  switch (config.mode) {
    case "default":
      return null; // Omit the line completely, use Outseta default
    case "message":
      return "undefined"; // Explicitly use the embed message
    case "page":
      return `new URL("${config.path}", window.location.origin).href`;
    case "custom":
      return JSON.stringify(config.url);
  }
};

// Convert a parsed JavaScript expression back to a config object.
export const postSignupExpressionToMode = (
  expression: string | undefined,
): PostSignupConfig => {
  if (expression === undefined) {
    return { mode: "default" };
  }

  const trimmed = expression.trim();

  if (trimmed === "undefined") {
    return { mode: "message" };
  }

  // Page Mode: new URL("/path", window.location.origin).href
  const pageMatch = trimmed.match(
    /^new\s+URL\s*\(\s*"([^"]+)"\s*,\s*window\.location\.origin\s*\)\s*\.href$/,
  );
  if (pageMatch) {
    return { mode: "page", path: pageMatch[1] };
  }

  // Custom Mode: quoted absolute or relative URL
  const customMatch = trimmed.match(/^['"]([^'"]+)['"]$/);
  if (customMatch) {
    return { mode: "custom", url: customMatch[1] };
  }

  // Fallback: if it's some other expression, treat as default to be safe
  return { mode: "default" };
};


