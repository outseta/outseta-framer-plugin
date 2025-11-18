import { z } from "zod";

export const tokenStorageSchema = z.object({
  tokenStorage: z.enum(["session", "local", "cookie"]),
});

export type TokenStorageConfig = z.infer<typeof tokenStorageSchema>;

export const defaultTokenStorageConfig: TokenStorageConfig = {
  tokenStorage: "local",
};

// Convert config to a JavaScript expression suitable for the script generator.
export const tokenStorageConfigToExpression = (
  config: TokenStorageConfig,
): string => {
  return JSON.stringify(config.tokenStorage);
};

// Convert a parsed JavaScript expression back to a config object.
export const tokenStorageExpressionToConfig = (
  expression: string = "",
): TokenStorageConfig => {
  expression = expression.trim();

  // Remove quotes if present
  const cleanExpression = expression.replace(/^["']|["']$/g, "");

  // Validate the value is one of the expected options
  if (
    cleanExpression === "session" ||
    cleanExpression === "local" ||
    cleanExpression === "cookie"
  ) {
    return { tokenStorage: cleanExpression };
  }

  // Fallback to default
  return defaultTokenStorageConfig;
};
