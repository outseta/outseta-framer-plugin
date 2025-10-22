import { describe, it, expect } from "vitest";
import {
  authCallbackModeToUrlExpression,
  authCallbackUrlExpressionToMode,
  type AuthCallbackConfig,
} from "./script-auth-callback";

describe("authCallbackModeToUrlExpression", () => {
  it("should return undefined for default mode", () => {
    const config: AuthCallbackConfig = { mode: "default" };
    const result = authCallbackModeToUrlExpression(config);
    expect(result).toBeUndefined();
  });

  it("should return window.location.href for current mode", () => {
    const config: AuthCallbackConfig = { mode: "current" };
    const result = authCallbackModeToUrlExpression(config);
    expect(result).toBe("window.location.href");
  });

  it("should return new URL expression for page mode", () => {
    const config: AuthCallbackConfig = { mode: "page", path: "/dashboard" };
    const result = authCallbackModeToUrlExpression(config);
    expect(result).toBe('new URL("/dashboard", window.location.origin).href');
  });

  it("should return new URL expression for page mode with complex path", () => {
    const config: AuthCallbackConfig = {
      mode: "page",
      path: "/auth/callback?redirect=/profile",
    };
    const result = authCallbackModeToUrlExpression(config);
    expect(result).toBe(
      'new URL("/auth/callback?redirect=/profile", window.location.origin).href',
    );
  });

  it("should return quoted string for custom mode", () => {
    const config: AuthCallbackConfig = {
      mode: "custom",
      path: "https://example.com/callback",
    };
    const result = authCallbackModeToUrlExpression(config);
    expect(result).toBe('"https://example.com/callback"');
  });

  it("should return quoted string for custom mode with complex URL", () => {
    const config: AuthCallbackConfig = {
      mode: "custom",
      path: "https://myapp.com/auth/callback?state=xyz&redirect=/dashboard",
    };
    const result = authCallbackModeToUrlExpression(config);
    expect(result).toBe(
      '"https://myapp.com/auth/callback?state=xyz&redirect=/dashboard"',
    );
  });

  it("should handle empty path in page mode", () => {
    const config: AuthCallbackConfig = { mode: "page", path: "" };
    const result = authCallbackModeToUrlExpression(config);
    expect(result).toBe('new URL("", window.location.origin).href');
  });

  it("should handle empty path in custom mode", () => {
    const config: AuthCallbackConfig = { mode: "custom", path: "" };
    const result = authCallbackModeToUrlExpression(config);
    expect(result).toBe('""');
  });
});

describe("authCallbackUrlExpressionToMode", () => {
  it("should return default mode for undefined expression", () => {
    const result = authCallbackUrlExpressionToMode(undefined);
    expect(result).toEqual({ mode: "default" });
  });

  it("should return default mode for empty string", () => {
    const result = authCallbackUrlExpressionToMode("");
    expect(result).toEqual({ mode: "default" });
  });

  it("should return current mode for window.location.href", () => {
    const result = authCallbackUrlExpressionToMode("window.location.href");
    expect(result).toEqual({ mode: "current" });
  });

  it("should return page mode for new URL expression", () => {
    const result = authCallbackUrlExpressionToMode(
      'new URL("/dashboard", window.location.origin).href',
    );
    expect(result).toEqual({ mode: "page", path: "/dashboard" });
  });

  it("should return page mode for new URL expression with complex path", () => {
    const result = authCallbackUrlExpressionToMode(
      'new URL("/auth/callback?redirect=/profile", window.location.origin).href',
    );
    expect(result).toEqual({
      mode: "page",
      path: "/auth/callback?redirect=/profile",
    });
  });

  it("should return default mode for new URL expression with empty path", () => {
    const result = authCallbackUrlExpressionToMode(
      'new URL("", window.location.origin).href',
    );
    expect(result).toEqual({ mode: "default" });
  });

  it("should return custom mode for quoted string", () => {
    const result = authCallbackUrlExpressionToMode(
      '"https://example.com/callback"',
    );
    expect(result).toEqual({
      mode: "custom",
      path: "https://example.com/callback",
    });
  });

  it("should return custom mode for quoted string with complex URL", () => {
    const result = authCallbackUrlExpressionToMode(
      '"https://myapp.com/auth/callback?state=xyz&redirect=/dashboard"',
    );
    expect(result).toEqual({
      mode: "custom",
      path: "https://myapp.com/auth/callback?state=xyz&redirect=/dashboard",
    });
  });

  it("should return default mode for quoted empty string", () => {
    const result = authCallbackUrlExpressionToMode('""');
    expect(result).toEqual({ mode: "default" });
  });

  it("should return default mode for new URL expression with additional whitespace", () => {
    const result = authCallbackUrlExpressionToMode(
      'new URL( "/dashboard"    , window.location.origin ).href',
    );
    expect(result).toEqual({ mode: "default" });
  });

  it("should handle new URL expression with less whitespace", () => {
    const result = authCallbackUrlExpressionToMode(
      'new URL("/dashboard",window.location.origin).href',
    );
    expect(result).toEqual({ mode: "page", path: "/dashboard" });
  });

  it("should return default mode for malformed expressions", () => {
    const result1 = authCallbackUrlExpressionToMode(
      'new URL("/dashboard", window.location.href).href',
    );
    const result2 = authCallbackUrlExpressionToMode(
      '"https://example.com/callback',
    );
    const result3 = authCallbackUrlExpressionToMode("someOtherExpression()");
    const result4 = authCallbackUrlExpressionToMode(
      'window.location.href + "/callback"',
    );
    const result5 = authCallbackUrlExpressionToMode(
      'new URL("/path\\"with\\"quotes", window.location.origin).href',
    );
    const result6 = authCallbackUrlExpressionToMode(
      '"https://example.com/path\\"with\\"quotes"',
    );
    const result7 = authCallbackUrlExpressionToMode("hello()");

    expect(result1).toEqual({ mode: "default" });
    expect(result2).toEqual({ mode: "default" });
    expect(result3).toEqual({ mode: "default" });
    expect(result4).toEqual({ mode: "default" });
    expect(result5).toEqual({ mode: "default" });
    expect(result6).toEqual({ mode: "default" });
    expect(result7).toEqual({ mode: "default" });
  });
});

describe("authCallbackModeToUrlExpression and authCallbackUrlExpressionToMode roundtrip", () => {
  it("should maintain consistency for default mode", () => {
    const original: AuthCallbackConfig = { mode: "default" };
    const expression = authCallbackModeToUrlExpression(original);
    const converted = authCallbackUrlExpressionToMode(expression);
    expect(converted).toEqual(original);
  });

  it("should maintain consistency for current mode", () => {
    const original: AuthCallbackConfig = { mode: "current" };
    const expression = authCallbackModeToUrlExpression(original);
    const converted = authCallbackUrlExpressionToMode(expression);
    expect(converted).toEqual(original);
  });

  it("should maintain consistency for page mode", () => {
    const original: AuthCallbackConfig = {
      mode: "page",
      path: "/dashboard",
    };
    const expression = authCallbackModeToUrlExpression(original);
    const converted = authCallbackUrlExpressionToMode(expression);
    expect(converted).toEqual(original);
  });

  it("should maintain consistency for page mode with complex path", () => {
    const original: AuthCallbackConfig = {
      mode: "page",
      path: "/auth/callback?redirect=/profile",
    };
    const expression = authCallbackModeToUrlExpression(original);
    const converted = authCallbackUrlExpressionToMode(expression);
    expect(converted).toEqual(original);
  });

  it("should maintain consistency for custom mode", () => {
    const original: AuthCallbackConfig = {
      mode: "custom",
      path: "https://example.com/callback",
    };
    const expression = authCallbackModeToUrlExpression(original);
    const converted = authCallbackUrlExpressionToMode(expression);
    expect(converted).toEqual(original);
  });

  it("should maintain consistency for custom mode with complex URL", () => {
    const original: AuthCallbackConfig = {
      mode: "custom",
      path: "https://myapp.com/auth/callback?state=xyz&redirect=/dashboard",
    };
    const expression = authCallbackModeToUrlExpression(original);
    const converted = authCallbackUrlExpressionToMode(expression);
    expect(converted).toEqual(original);
  });

  it("should fallback to default mode for page mode with empty path", () => {
    const original: AuthCallbackConfig = { mode: "page", path: "" };
    const expression = authCallbackModeToUrlExpression(original);
    const converted = authCallbackUrlExpressionToMode(expression);
    expect(converted).toEqual({ mode: "default" });
  });

  it("should fallback to default mode for custom mode with empty path", () => {
    const original: AuthCallbackConfig = { mode: "custom", path: "" };
    const expression = authCallbackModeToUrlExpression(original);
    const converted = authCallbackUrlExpressionToMode(expression);
    expect(converted).toEqual({ mode: "default" });
  });
});
