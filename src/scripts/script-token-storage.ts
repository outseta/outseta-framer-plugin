import { z } from "zod";

export const tokenStorageSchema = z.object({
  tokenStorageMode: z.enum(["session", "local", "cookie"]),
});

export type TokenStorageConfig = z.infer<typeof tokenStorageSchema>;

export const DEFAULT_TOKEN_STORAGE_CONFIG: TokenStorageConfig = {
  tokenStorageMode: "local",
};

// Convert config to a JavaScript expression suitable for the script generator.
export const tokenStorageConfigToExpression = (
  config: TokenStorageConfig = DEFAULT_TOKEN_STORAGE_CONFIG,
): string => {
  return JSON.stringify(config.tokenStorageMode);
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
    return { tokenStorageMode: cleanExpression };
  }

  // Fallback to default
  return DEFAULT_TOKEN_STORAGE_CONFIG;
};
