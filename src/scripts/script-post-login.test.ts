import { describe, it, expect } from "vitest";
import {
  authCallbackConfigToExpression,
  authCallbackExpressionToConfig,
  type PostLoginConfig,
} from "./script-post-login";

describe("authCallbackConfigToExpression", () => {
  describe("default mode", () => {
    it("returns undefined", () => {
      const config: PostLoginConfig = { postLoginMode: "default" };
      const result = authCallbackConfigToExpression(config);
      expect(result).toBe(undefined);
    });
  });

  describe("current mode", () => {
    it("returns window.location.href literal", () => {
      const config: PostLoginConfig = { postLoginMode: "current" };
      const result = authCallbackConfigToExpression(config);
      expect(result).toBe("window.location.href");
    });
  });

  describe("page mode", () => {
    it("returns new URL expression with path", () => {
      const config: PostLoginConfig = {
        postLoginMode: "page",
        postLoginPagePath: "/dashboard",
      };
      const result = authCallbackConfigToExpression(config);
      expect(result).toBe('new URL("/dashboard", window.location.origin).href');
    });

    it("returns new URL expression for empty path", () => {
      const config: PostLoginConfig = {
        postLoginMode: "page",
        postLoginPagePath: "",
      };
      const result = authCallbackConfigToExpression(config);
      expect(result).toBe('new URL("", window.location.origin).href');
    });
  });

  describe("custom mode", () => {
    it("returns quoted string", () => {
      const config: PostLoginConfig = {
        postLoginMode: "custom",
        postLoginCustomUrl: "https://example.com/callback",
      };
      const result = authCallbackConfigToExpression(config);
      expect(result).toBe('"https://example.com/callback"');
    });

    it("returns quoted empty string for empty url", () => {
      const config: PostLoginConfig = {
        postLoginMode: "custom",
        postLoginCustomUrl: "",
      };
      const result = authCallbackConfigToExpression(config);
      expect(result).toBe('""');
    });
  });
});

describe("authCallbackExpressionToConfig", () => {
  describe("default mode", () => {
    it("for undefined", () => {
      const result = authCallbackExpressionToConfig(undefined);
      expect(result).toEqual({ postLoginMode: "default" });
    });

    it("for undefined expression", () => {
      const result = authCallbackExpressionToConfig("undefined");
      expect(result).toEqual({ postLoginMode: "default" });
    });
    it("for empty expression", () => {
      const result = authCallbackExpressionToConfig("");
      expect(result).toEqual({ postLoginMode: "default" });
    });
    it("for quoted empty string", () => {
      const result = authCallbackExpressionToConfig('""');
      expect(result).toEqual({ postLoginMode: "default" });
    });

    it("for quoted empty string with additional whitespace", () => {
      const result1 = authCallbackExpressionToConfig('"   "');
      expect(result1).toEqual({ postLoginMode: "default" });
      const result2 = authCallbackExpressionToConfig('    ""    ');
      expect(result2).toEqual({ postLoginMode: "default" });
    });

    it("for new URL expression with empty path", () => {
      const result = authCallbackExpressionToConfig(
        'new URL("", window.location.origin).href',
      );
      expect(result).toEqual({ postLoginMode: "default" });
    });

    it("for new URL expression with additional whitespace", () => {
      const result1 = authCallbackExpressionToConfig(
        'new URL("    ", window.location.origin).href    ',
      );
      expect(result1).toEqual({ postLoginMode: "default" });
      const result2 = authCallbackExpressionToConfig(
        '    new URL("", window.location.origin).href',
      );
      expect(result2).toEqual({ postLoginMode: "default" });
    });

    it("for invalid expressions", () => {
      const result1 = authCallbackExpressionToConfig(
        // window.location.href should be window.location.origin
        'new URL("/dashboard", window.location.href).href',
      );
      const result2 = authCallbackExpressionToConfig(
        '"https://example.com/callback',
      );
      const result3 = authCallbackExpressionToConfig("someOtherExpression()");
      const result4 = authCallbackExpressionToConfig(
        'window.location.href + "/callback"',
      );
      const result5 = authCallbackExpressionToConfig(
        'new URL("/path\\"with\\"quotes", window.location.origin).href',
      );
      const result6 = authCallbackExpressionToConfig(
        '"https://example.com/path\\"with\\"quotes"',
      );
      const result7 = authCallbackExpressionToConfig("hello()");

      expect(result1).toEqual({ postLoginMode: "default" });
      expect(result2).toEqual({ postLoginMode: "default" });
      expect(result3).toEqual({ postLoginMode: "default" });
      expect(result4).toEqual({ postLoginMode: "default" });
      expect(result5).toEqual({ postLoginMode: "default" });
      expect(result6).toEqual({ postLoginMode: "default" });
      expect(result7).toEqual({ postLoginMode: "default" });
    });
  });

  describe("current mode", () => {
    it("for window.location.href", () => {
      const result = authCallbackExpressionToConfig("window.location.href");
      expect(result).toEqual({ postLoginMode: "current" });
    });

    it("for window.location.href with additional whitespace", () => {
      const result1 = authCallbackExpressionToConfig(
        "window.location.href    ",
      );
      expect(result1).toEqual({ postLoginMode: "current" });
      const result2 = authCallbackExpressionToConfig(
        "    window.location.href",
      );
      expect(result2).toEqual({ postLoginMode: "current" });
    });

    it("for earlier plugin version ternary expression", () => {
      const result = authCallbackExpressionToConfig(
        '"" ? new URL("", window.location.origin).href : window.location.href',
      );
      expect(result).toEqual({ postLoginMode: "current" });
    });
  });

  describe("page mode", () => {
    it("for new URL expression", () => {
      const result = authCallbackExpressionToConfig(
        'new URL("/dashboard", window.location.origin).href',
      );
      expect(result).toEqual({
        postLoginMode: "page",
        postLoginPagePath: "/dashboard",
      });
    });

    it("for new URL expression with additional whitespace", () => {
      const result = authCallbackExpressionToConfig(
        'new URL( "/dashboard"    , window.location.origin ).href',
      );
      expect(result).toEqual({
        postLoginMode: "page",
        postLoginPagePath: "/dashboard",
      });
    });

    it("for new URL expression with less whitespace", () => {
      const result = authCallbackExpressionToConfig(
        'new URL("/dashboard",window.location.origin).href',
      );
      expect(result).toEqual({
        postLoginMode: "page",
        postLoginPagePath: "/dashboard",
      });
    });

    it("for plugin version 1 expression", () => {
      const result = authCallbackExpressionToConfig(
        '"/dashboard" ? new URL("/dashboard", window.location.origin).href : window.location.href',
      );
      expect(result).toEqual({
        postLoginMode: "page",
        postLoginPagePath: "/dashboard",
      });
    });
  });

  describe("custom mode", () => {
    it("for quoted string url expression", () => {
      const result = authCallbackExpressionToConfig(
        '"https://example.com/callback"',
      );
      expect(result).toEqual({
        postLoginMode: "custom",
        postLoginCustomUrl: "https://example.com/callback",
      });
    });

    it("for quoted string expression that is not a valid url", () => {
      const result = authCallbackExpressionToConfig('"hello hello"');
      expect(result).toEqual({
        postLoginMode: "custom",
        postLoginCustomUrl: "hello hello",
      });
    });
  });
});

describe("authCallbackConfigToExpression and authCallbackExpressionToConfig roundtrip", () => {
  it("should maintain consistency for default mode", () => {
    const original: PostLoginConfig = { postLoginMode: "default" };
    const expression = authCallbackConfigToExpression(original);
    const converted = authCallbackExpressionToConfig(expression);
    expect(converted).toEqual(original);
  });

  it("should maintain consistency for current mode", () => {
    const original: PostLoginConfig = { postLoginMode: "current" };
    const expression = authCallbackConfigToExpression(original);
    const converted = authCallbackExpressionToConfig(expression);
    expect(converted).toEqual(original);
  });

  it("should maintain consistency for page mode", () => {
    const original: PostLoginConfig = {
      postLoginMode: "page",
      postLoginPagePath: "/dashboard",
    };
    const expression = authCallbackConfigToExpression(original);
    const converted = authCallbackExpressionToConfig(expression);
    expect(converted).toEqual(original);
  });

  it("should maintain consistency for page mode with complex path", () => {
    const original: PostLoginConfig = {
      postLoginMode: "page",
      postLoginPagePath: "/auth/callback?redirect=/profile",
    };
    const expression = authCallbackConfigToExpression(original);
    const converted = authCallbackExpressionToConfig(expression);
    expect(converted).toEqual(original);
  });

  it("should maintain consistency for custom mode", () => {
    const original: PostLoginConfig = {
      postLoginMode: "custom",
      postLoginCustomUrl: "https://example.com/callback",
    };
    const expression = authCallbackConfigToExpression(original);
    const converted = authCallbackExpressionToConfig(expression);
    expect(converted).toEqual(original);
  });

  it("should maintain consistency for custom mode with complex URL", () => {
    const original: PostLoginConfig = {
      postLoginMode: "custom",
      postLoginCustomUrl:
        "https://myapp.com/auth/callback?state=xyz&redirect=/dashboard",
    };
    const expression = authCallbackConfigToExpression(original);
    const converted = authCallbackExpressionToConfig(expression);
    expect(converted).toEqual(original);
  });

  it("should fallback to default mode for page mode with empty path", () => {
    const original: PostLoginConfig = {
      postLoginMode: "page",
      postLoginPagePath: "",
    };
    const expression = authCallbackConfigToExpression(original);
    const converted = authCallbackExpressionToConfig(expression);
    expect(converted).toEqual({ postLoginMode: "default" });
  });

  it("should fallback to default mode for custom mode with empty url", () => {
    const original: PostLoginConfig = {
      postLoginMode: "custom",
      postLoginCustomUrl: "",
    };
    const expression = authCallbackConfigToExpression(original);
    const converted = authCallbackExpressionToConfig(expression);
    expect(converted).toEqual({ postLoginMode: "default" });
  });
});
