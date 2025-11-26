import { describe, it, expect } from "vitest";
import {
  tokenStorageConfigToExpression,
  tokenStorageExpressionToConfig,
  defaultTokenStorageConfig,
  type TokenStorageConfig,
} from "./script-token-storage";

describe("tokenStorageConfigToExpression", () => {
  it("should convert local to quoted string", () => {
    const config: TokenStorageConfig = { tokenStorage: "local" };
    expect(tokenStorageConfigToExpression(config)).toBe('"local"');
  });

  it("should convert session to quoted string", () => {
    const config: TokenStorageConfig = { tokenStorage: "session" };
    expect(tokenStorageConfigToExpression(config)).toBe('"session"');
  });

  it("should convert cookie to quoted string", () => {
    const config: TokenStorageConfig = { tokenStorage: "cookie" };
    expect(tokenStorageConfigToExpression(config)).toBe('"cookie"');
  });
});

describe("tokenStorageExpressionToConfig", () => {
  it("should parse local with double quotes", () => {
    const expression = '"local"';
    expect(tokenStorageExpressionToConfig(expression)).toEqual({
      tokenStorage: "local",
    });
  });

  it("should parse session with single quotes", () => {
    const expression = "'session'";
    expect(tokenStorageExpressionToConfig(expression)).toEqual({
      tokenStorage: "session",
    });
  });

  it("should parse cookie with double quotes", () => {
    const expression = '"cookie"';
    expect(tokenStorageExpressionToConfig(expression)).toEqual({
      tokenStorage: "cookie",
    });
  });

  it("should parse local without quotes", () => {
    const expression = "local";
    expect(tokenStorageExpressionToConfig(expression)).toEqual({
      tokenStorage: "local",
    });
  });

  it("should parse session without quotes", () => {
    const expression = "session";
    expect(tokenStorageExpressionToConfig(expression)).toEqual({
      tokenStorage: "session",
    });
  });

  it("should parse cookie without quotes", () => {
    const expression = "cookie";
    expect(tokenStorageExpressionToConfig(expression)).toEqual({
      tokenStorage: "cookie",
    });
  });

  it("should default to local for empty string", () => {
    const expression = "";
    expect(tokenStorageExpressionToConfig(expression)).toEqual(
      defaultTokenStorageConfig,
    );
  });

  it("should default to local for undefined", () => {
    expect(tokenStorageExpressionToConfig(undefined)).toEqual(
      defaultTokenStorageConfig,
    );
  });

  it("should parse undefined expression as default mode", () => {
    const result = tokenStorageExpressionToConfig("undefined");
    expect(result).toEqual(defaultTokenStorageConfig);
  });

  it("should default to local for invalid value", () => {
    const expression = '"invalid"';
    expect(tokenStorageExpressionToConfig(expression)).toEqual(
      defaultTokenStorageConfig,
    );
  });

  it("should handle whitespace", () => {
    const expression = '  "local"  ';
    expect(tokenStorageExpressionToConfig(expression)).toEqual({
      tokenStorage: "local",
    });
  });
});
