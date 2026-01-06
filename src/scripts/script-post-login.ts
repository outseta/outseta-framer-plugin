import {
  CURRENT_MODE_REGEX,
  CURRENT_MODE_TERNARY_REGEX,
  CUSTOM_MODE_REGEX,
  PAGE_MODE_REGEX,
  PAGE_MODE_TERNARY_REGEX,
} from "./script-regex";
import { z } from "zod";

export const postLoginSchema = z.discriminatedUnion("postLoginMode", [
  z.object({
    postLoginMode: z.literal("default"),
  }),
  z.object({
    postLoginMode: z.literal("current"),
  }),
  z.object({
    postLoginMode: z.literal("page"),
    postLoginPagePath: z
      .string()
      .nonempty({ message: "A page path is required" }),
  }),
  z.object({
    postLoginMode: z.literal("custom"),
    postLoginCustomUrl: z.url("A valid URL is required"),
  }),
]);

export type PostLoginConfig = z.infer<typeof postLoginSchema>;

export const DEFAULT_POST_LOGIN_CONFIG: PostLoginConfig = {
  postLoginMode: "default",
};

// Convert config to a JavaScript expression suitable for the script generator.
export const authCallbackConfigToExpression = (
  config: PostLoginConfig = DEFAULT_POST_LOGIN_CONFIG,
): string | undefined => {
  switch (config.postLoginMode) {
    case "default":
      return undefined;
    case "current":
      return `window.location.href`;
    case "page":
      return `new URL(${JSON.stringify(config.postLoginPagePath)}, window.location.origin).href`;
    case "custom":
      return JSON.stringify(config.postLoginCustomUrl);
    default:
      return undefined;
  }
};

// Convert a parsed JavaScript expression back to a config object.
export const authCallbackExpressionToConfig = (
  expression: string = "",
): PostLoginConfig => {
  expression = expression.trim();

  /** Earlier plugin version ternary expressions (check before direct patterns) */
  // Current Mode: "" ? new URL("", window.location.origin).href : window.location.href
  const currentTernaryMatch = expression.match(CURRENT_MODE_TERNARY_REGEX);
  if (currentTernaryMatch) {
    return { postLoginMode: "current" };
  }

  // Page Mode: "/path" ? new URL("/path", window.location.origin).href : window.location.href
  const pageTernaryMatch = expression.match(PAGE_MODE_TERNARY_REGEX);
  if (pageTernaryMatch) {
    // Both capture groups should match the same path, use the first one
    return { postLoginMode: "page", postLoginPagePath: pageTernaryMatch[1] };
  }

  /** End of earlier plugin version ternary expressions */

  // Current Mode: window.location.href
  const currentMatch = expression.match(CURRENT_MODE_REGEX);
  if (currentMatch) {
    return { postLoginMode: "current" };
  }

  // Page Mode: new URL("/path", window.location.origin).href
  const pageMatch = expression.match(PAGE_MODE_REGEX);
  if (pageMatch) {
    return { postLoginMode: "page", postLoginPagePath: pageMatch[1] };
  }

  // Custom Mode: quoted absolute or relative URL
  const customMatch = expression.match(CUSTOM_MODE_REGEX);
  if (customMatch) {
    return { postLoginMode: "custom", postLoginCustomUrl: customMatch[1] };
  }

  // Fallback to default mode
  return DEFAULT_POST_LOGIN_CONFIG;
};
