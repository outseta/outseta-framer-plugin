import { describe, it, expect } from "vitest";
import {
  authCallbackConfigToExpression,
  authCallbackExpressionToMode,
  type AuthCallbackConfig,
} from "./script-auth-callback";

describe("authCallbackModeToUrlExpression", () => {
  describe("default mode", () => {
    it("returns undefined literal", () => {
      const config: AuthCallbackConfig = { mode: "default" };
      const result = authCallbackConfigToExpression(config);
      expect(result).toBe("undefined");
    });
  });

  describe("current mode", () => {
    it("returns window.location.href literal", () => {
      const config: AuthCallbackConfig = { mode: "current" };
      const result = authCallbackConfigToExpression(config);
      expect(result).toBe("window.location.href");
    });
  });

  describe("page mode", () => {
    it("returns new URL expression with path", () => {
      const config: AuthCallbackConfig = { mode: "page", path: "/dashboard" };
      const result = authCallbackConfigToExpression(config);
      expect(result).toBe('new URL("/dashboard", window.location.origin).href');
    });

    it("returns new URL expression for empty path", () => {
      const config: AuthCallbackConfig = { mode: "page", path: "" };
      const result = authCallbackConfigToExpression(config);
      expect(result).toBe('new URL("", window.location.origin).href');
    });
  });

  describe("custom mode", () => {
    it("returns quoted string", () => {
      const config: AuthCallbackConfig = {
        mode: "custom",
        url: "https://example.com/callback",
      };
      const result = authCallbackConfigToExpression(config);
      expect(result).toBe('"https://example.com/callback"');
    });

    it("returns quoted empty string for empty url", () => {
      const config: AuthCallbackConfig = { mode: "custom", url: "" };
      const result = authCallbackConfigToExpression(config);
      expect(result).toBe('""');
    });
  });
});

describe("authCallbackUrlExpressionToMode", () => {
  describe("default mode", () => {
    it("for undefined literal", () => {
      expect(authCallbackExpressionToMode("undefined")).toEqual({
        mode: "default",
      });
    });
    it("for empty expression", () => {
      const result = authCallbackExpressionToMode("");
      expect(result).toEqual({ mode: "default" });
    });
    it("for quoted empty string", () => {
      const result = authCallbackExpressionToMode('""');
      expect(result).toEqual({ mode: "default" });
    });

    it("for quoted empty string with additional whitespace", () => {
      const result1 = authCallbackExpressionToMode('"   "');
      expect(result1).toEqual({ mode: "default" });
      const result2 = authCallbackExpressionToMode('    ""    ');
      expect(result2).toEqual({ mode: "default" });
    });

    it("for new URL expression with empty path", () => {
      const result = authCallbackExpressionToMode(
        'new URL("", window.location.origin).href',
      );
      expect(result).toEqual({ mode: "default" });
    });

    it("for new URL expression with additional whitespace", () => {
      const result1 = authCallbackExpressionToMode(
        'new URL("    ", window.location.origin).href    ',
      );
      expect(result1).toEqual({ mode: "default" });
      const result2 = authCallbackExpressionToMode(
        '    new URL("", window.location.origin).href',
      );
      expect(result2).toEqual({ mode: "default" });
    });

    it("for invalid expressions", () => {
      const result1 = authCallbackExpressionToMode(
        'new URL("/dashboard", window.location.href).href',
      );
      const result2 = authCallbackExpressionToMode(
        '"https://example.com/callback',
      );
      const result3 = authCallbackExpressionToMode("someOtherExpression()");
      const result4 = authCallbackExpressionToMode(
        'window.location.href + "/callback"',
      );
      const result5 = authCallbackExpressionToMode(
        'new URL("/path\\"with\\"quotes", window.location.origin).href',
      );
      const result6 = authCallbackExpressionToMode(
        '"https://example.com/path\\"with\\"quotes"',
      );
      const result7 = authCallbackExpressionToMode("hello()");

      expect(result1).toEqual({ mode: "default" });
      expect(result2).toEqual({ mode: "default" });
      expect(result3).toEqual({ mode: "default" });
      expect(result4).toEqual({ mode: "default" });
      expect(result5).toEqual({ mode: "default" });
      expect(result6).toEqual({ mode: "default" });
      expect(result7).toEqual({ mode: "default" });
    });
  });

  describe("current mode", () => {
    it("for window.location.href", () => {
      const result = authCallbackExpressionToMode("window.location.href");
      expect(result).toEqual({ mode: "current" });
    });

    it("for window.location.href with additional whitespace", () => {
      const result1 = authCallbackExpressionToMode("window.location.href    ");
      expect(result1).toEqual({ mode: "current" });
      const result2 = authCallbackExpressionToMode("    window.location.href");
      expect(result2).toEqual({ mode: "current" });
    });
  });

  describe("page mode", () => {
    it("for new URL expression", () => {
      const result = authCallbackExpressionToMode(
        'new URL("/dashboard", window.location.origin).href',
      );
      expect(result).toEqual({ mode: "page", path: "/dashboard" });
    });

    it("for new URL expression with additional whitespace", () => {
      const result = authCallbackExpressionToMode(
        'new URL( "/dashboard"    , window.location.origin ).href',
      );
      expect(result).toEqual({ mode: "page", path: "/dashboard" });
    });

    it("for new URL expression with less whitespace", () => {
      const result = authCallbackExpressionToMode(
        'new URL("/dashboard",window.location.origin).href',
      );
      expect(result).toEqual({ mode: "page", path: "/dashboard" });
    });
  });

  describe("custom mode", () => {
    it("for quoted string", () => {
      const result = authCallbackExpressionToMode(
        '"https://example.com/callback"',
      );
      expect(result).toEqual({
        mode: "custom",
        url: "https://example.com/callback",
      });
    });
  });
});

describe("authCallbackModeToUrlExpression and authCallbackUrlExpressionToMode roundtrip", () => {
  it("should maintain consistency for default mode", () => {
    const original: AuthCallbackConfig = { mode: "default" };
    const expression = authCallbackConfigToExpression(original);
    const converted = authCallbackExpressionToMode(expression);
    expect(converted).toEqual(original);
  });

  it("should maintain consistency for current mode", () => {
    const original: AuthCallbackConfig = { mode: "current" };
    const expression = authCallbackConfigToExpression(original);
    const converted = authCallbackExpressionToMode(expression);
    expect(converted).toEqual(original);
  });

  it("should maintain consistency for page mode", () => {
    const original: AuthCallbackConfig = {
      mode: "page",
      path: "/dashboard",
    };
    const expression = authCallbackConfigToExpression(original);
    const converted = authCallbackExpressionToMode(expression);
    expect(converted).toEqual(original);
  });

  it("should maintain consistency for page mode with complex path", () => {
    const original: AuthCallbackConfig = {
      mode: "page",
      path: "/auth/callback?redirect=/profile",
    };
    const expression = authCallbackConfigToExpression(original);
    const converted = authCallbackExpressionToMode(expression);
    expect(converted).toEqual(original);
  });

  it("should maintain consistency for custom mode", () => {
    const original: AuthCallbackConfig = {
      mode: "custom",
      url: "https://example.com/callback",
    };
    const expression = authCallbackConfigToExpression(original);
    const converted = authCallbackExpressionToMode(expression);
    expect(converted).toEqual(original);
  });

  it("should maintain consistency for custom mode with complex URL", () => {
    const original: AuthCallbackConfig = {
      mode: "custom",
      url: "https://myapp.com/auth/callback?state=xyz&redirect=/dashboard",
    };
    const expression = authCallbackConfigToExpression(original);
    const converted = authCallbackExpressionToMode(expression);
    expect(converted).toEqual(original);
  });

  it("should fallback to default mode for page mode with empty path", () => {
    const original: AuthCallbackConfig = { mode: "page", path: "" };
    const expression = authCallbackConfigToExpression(original);
    const converted = authCallbackExpressionToMode(expression);
    expect(converted).toEqual({ mode: "default" });
  });

  it("should fallback to default mode for custom mode with empty url", () => {
    const original: AuthCallbackConfig = { mode: "custom", url: "" };
    const expression = authCallbackConfigToExpression(original);
    const converted = authCallbackExpressionToMode(expression);
    expect(converted).toEqual({ mode: "default" });
  });
});
