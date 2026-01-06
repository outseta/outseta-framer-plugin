import {
  CUSTOM_MODE_REGEX,
  DEFAULT_MODE_TERNARY_REGEX,
  PAGE_MODE_REGEX,
  PAGE_MODE_TERNARY_UNDEFINED_REGEX,
  MESSAGE_MODE_REGEX,
} from "./script-regex";
import { z } from "zod";

export const postSignupSchema = z.discriminatedUnion("postSignupMode", [
  z.object({
    postSignupMode: z.literal("default"),
  }),
  z.object({
    postSignupMode: z.literal("message"),
  }),
  z.object({
    postSignupMode: z.literal("page"),
    postSignupPagePath: z
      .string()
      .nonempty({ message: "A page path is required" }),
  }),
  z.object({
    postSignupMode: z.literal("custom"),
    postSignupCustomUrl: z.url("A valid URL is required"),
  }),
]);

export type PostSignupConfig = z.infer<typeof postSignupSchema>;

export const DEFAULT_POST_SIGNUP_CONFIG: PostSignupConfig = {
  postSignupMode: "default",
};

// Convert config to a JavaScript expression suitable for the script generator.
export const postSignupConfigToExpression = (
  config: PostSignupConfig = DEFAULT_POST_SIGNUP_CONFIG,
): string | undefined => {
  switch (config.postSignupMode) {
    case "default":
      return undefined;
    case "message":
      return "null";
    case "page":
      return `new URL(${JSON.stringify(config.postSignupPagePath)}, window.location.origin).href`;
    case "custom":
      return JSON.stringify(config.postSignupCustomUrl);
    default:
      return undefined;
  }
};

// Convert a parsed JavaScript expression back to a config object.
export const postSignupExpressionToConfig = (
  expression: string = "",
): PostSignupConfig => {
  expression = expression.trim();

  /** Earlier plugin version ternary expressions (check before direct patterns) */
  // Default Mode: "" ? new URL("", window.location.origin).href : undefined
  const defaultTernaryMatch = expression.match(DEFAULT_MODE_TERNARY_REGEX);
  if (defaultTernaryMatch) {
    return { postSignupMode: "default" };
  }

  // Page Mode: "/path" ? new URL("/path", window.location.origin).href : undefined
  const pageTernaryMatch = expression.match(PAGE_MODE_TERNARY_UNDEFINED_REGEX);
  if (pageTernaryMatch) {
    // Both capture groups should match the same path, use the first one
    return { postSignupMode: "page", postSignupPagePath: pageTernaryMatch[1] };
  }

  /** End of earlier plugin version ternary expressions */

  // Message Mode: 'null'
  const messageMatch = expression.match(MESSAGE_MODE_REGEX);
  if (messageMatch) {
    return { postSignupMode: "message" };
  }

  // Page Mode: new URL("/path", window.location.origin).href
  const pageMatch = expression.match(PAGE_MODE_REGEX);
  if (pageMatch) {
    return { postSignupMode: "page", postSignupPagePath: pageMatch[1] };
  }

  // Custom Mode: quoted absolute or relative URL
  const customMatch = expression.match(CUSTOM_MODE_REGEX);
  if (customMatch) {
    return { postSignupMode: "custom", postSignupCustomUrl: customMatch[1] };
  }

  // Fallback to default mode
  return DEFAULT_POST_SIGNUP_CONFIG;
};
