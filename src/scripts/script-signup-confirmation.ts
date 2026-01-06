import {
  CURRENT_MODE_REGEX,
  CUSTOM_MODE_REGEX,
  PAGE_MODE_REGEX,
} from "./script-regex";
import { z } from "zod";

export const signupConfirmationSchema = z.discriminatedUnion(
  "signupConfirmationMode",
  [
    z.object({
      signupConfirmationMode: z.literal("default"),
    }),
    z.object({
      signupConfirmationMode: z.literal("current"),
    }),
    z.object({
      signupConfirmationMode: z.literal("page"),
      signupConfirmationPagePath: z
        .string()
        .nonempty({ message: "A page path is required" }),
    }),
    z.object({
      signupConfirmationMode: z.literal("custom"),
      signupConfirmationCustomUrl: z.url("A valid URL is required"),
    }),
  ],
);

export type SignupConfirmationConfig = z.infer<typeof signupConfirmationSchema>;

export const DEFAULT_SIGNUP_CONFIRMATION_CONFIG: SignupConfirmationConfig = {
  signupConfirmationMode: "default",
};

// Convert config to a JavaScript expression suitable for the script generator.
export const signupConfirmationConfigToExpression = (
  config: SignupConfirmationConfig = DEFAULT_SIGNUP_CONFIRMATION_CONFIG,
): string | undefined => {
  switch (config.signupConfirmationMode) {
    case "default":
      return undefined;
    case "current":
      return `window.location.href`;
    case "page":
      return `new URL(${JSON.stringify(config.signupConfirmationPagePath)}, window.location.origin).href`;
    case "custom":
      return JSON.stringify(config.signupConfirmationCustomUrl);
    default:
      return undefined;
  }
};

// Convert a parsed JavaScript expression back to a config object.
export const signupConfirmationExpressionToConfig = (
  expression: string = "",
): SignupConfirmationConfig => {
  expression = expression.trim();

  // Current Mode: window.location.href
  const currentMatch = expression.match(CURRENT_MODE_REGEX);
  if (currentMatch) {
    return { signupConfirmationMode: "current" };
  }

  // Page Mode: new URL("/path", window.location.origin).href
  const pageMatch = expression.match(PAGE_MODE_REGEX);
  if (pageMatch) {
    return {
      signupConfirmationMode: "page",
      signupConfirmationPagePath: pageMatch[1],
    };
  }

  // Custom Mode: quoted absolute or relative URL
  const customMatch = expression.match(CUSTOM_MODE_REGEX);
  if (customMatch) {
    return {
      signupConfirmationMode: "custom",
      signupConfirmationCustomUrl: customMatch[1],
    };
  }

  // Fallback to default mode
  return { signupConfirmationMode: "default" };
};
