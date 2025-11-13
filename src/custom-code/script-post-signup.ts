import {
  CUSTOM_MODE_REGEX,
  PAGE_MODE_REGEX,
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

export const defaultPostSignupConfig: PostSignupConfig = {
  postSignupMode: "default",
};

// Convert config to a JavaScript expression suitable for the script generator.
export const postSignupConfigToExpression = (
  config: PostSignupConfig,
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
export const postSignupExpressionToMode = (
  expression: string = "",
): PostSignupConfig => {
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
  return { postSignupMode: "default" };
};
