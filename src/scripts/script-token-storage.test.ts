import { describe, it, expect } from "vitest";
import {
  tokenStorageConfigToExpression,
  tokenStorageExpressionToConfig,
  DEFAULT_TOKEN_STORAGE_CONFIG,
  type TokenStorageConfig,
} from "./script-token-storage";

describe("tokenStorageConfigToExpression", () => {
  it("should convert local to quoted string", () => {
    const config: TokenStorageConfig = { tokenStorageMode: "local" };
    expect(tokenStorageConfigToExpression(config)).toBe('"local"');
  });

  it("should convert session to quoted string", () => {
    const config: TokenStorageConfig = { tokenStorageMode: "session" };
    expect(tokenStorageConfigToExpression(config)).toBe('"session"');
  });

  it("should convert cookie to quoted string", () => {
    const config: TokenStorageConfig = { tokenStorageMode: "cookie" };
    expect(tokenStorageConfigToExpression(config)).toBe('"cookie"');
  });
});

describe("tokenStorageExpressionToConfig", () => {
  it("should parse local with double quotes", () => {
    const expression = '"local"';
    expect(tokenStorageExpressionToConfig(expression)).toEqual({
      tokenStorageMode: "local",
    });
  });

  it("should parse session with single quotes", () => {
    const expression = "'session'";
    expect(tokenStorageExpressionToConfig(expression)).toEqual({
      tokenStorageMode: "session",
    });
  });

  it("should parse cookie with double quotes", () => {
    const expression = '"cookie"';
    expect(tokenStorageExpressionToConfig(expression)).toEqual({
      tokenStorageMode: "cookie",
    });
  });

  it("should parse local without quotes", () => {
    const expression = "local";
    expect(tokenStorageExpressionToConfig(expression)).toEqual({
      tokenStorageMode: "local",
    });
  });

  it("should parse session without quotes", () => {
    const expression = "session";
    expect(tokenStorageExpressionToConfig(expression)).toEqual({
      tokenStorageMode: "session",
    });
  });

  it("should parse cookie without quotes", () => {
    const expression = "cookie";
    expect(tokenStorageExpressionToConfig(expression)).toEqual({
      tokenStorageMode: "cookie",
    });
  });

  it("should default to local for empty string", () => {
    const expression = "";
    expect(tokenStorageExpressionToConfig(expression)).toEqual(
      DEFAULT_TOKEN_STORAGE_CONFIG,
    );
  });

  it("should default to local for undefined", () => {
    expect(tokenStorageExpressionToConfig(undefined)).toEqual(
      DEFAULT_TOKEN_STORAGE_CONFIG,
    );
  });

  it("should parse undefined expression as default mode", () => {
    const result = tokenStorageExpressionToConfig("undefined");
    expect(result).toEqual(DEFAULT_TOKEN_STORAGE_CONFIG);
  });

  it("should default to local for invalid value", () => {
    const expression = '"invalid"';
    expect(tokenStorageExpressionToConfig(expression)).toEqual(
      DEFAULT_TOKEN_STORAGE_CONFIG,
    );
  });

  it("should handle whitespace", () => {
    const expression = '  "local"  ';
    expect(tokenStorageExpressionToConfig(expression)).toEqual({
      tokenStorageMode: "local",
    });
  });
});
