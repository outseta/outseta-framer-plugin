import { describe, it, expect } from "vitest";
import {
  postSignupConfigToExpression,
  postSignupExpressionToConfig,
  type PostSignupConfig,
} from "./script-post-signup";

describe("postSignupConfigToExpression", () => {
  describe("default mode", () => {
    it("returns undefined", () => {
      const config: PostSignupConfig = { postSignupMode: "default" };
      const result = postSignupConfigToExpression(config);
      expect(result).toBe(undefined);
    });
  });

  describe("message mode", () => {
    it("returns null literal", () => {
      const config: PostSignupConfig = { postSignupMode: "message" };
      const result = postSignupConfigToExpression(config);
      expect(result).toBe("null");
    });
  });

  describe("page mode", () => {
    it("returns new URL expression with path", () => {
      const config: PostSignupConfig = {
        postSignupMode: "page",
        postSignupPagePath: "/welcome",
      };
      const result = postSignupConfigToExpression(config);
      expect(result).toBe('new URL("/welcome", window.location.origin).href');
    });

    it("returns new URL expression for empty path", () => {
      const config: PostSignupConfig = {
        postSignupMode: "page",
        postSignupPagePath: "",
      };
      const result = postSignupConfigToExpression(config);
      expect(result).toBe('new URL("", window.location.origin).href');
    });
  });

  describe("custom mode", () => {
    it("returns quoted string", () => {
      const config: PostSignupConfig = {
        postSignupMode: "custom",
        postSignupCustomUrl: "https://example.com/thanks",
      };
      const result = postSignupConfigToExpression(config);
      expect(result).toBe('"https://example.com/thanks"');
    });

    it("returns quoted empty string for empty url", () => {
      const config: PostSignupConfig = {
        postSignupMode: "custom",
        postSignupCustomUrl: "",
      };
      const result = postSignupConfigToExpression(config);
      expect(result).toBe('""');
    });
  });
});

describe("postSignupExpressionToConfig", () => {
  describe("default mode", () => {
    it("for undefined", () => {
      const result = postSignupExpressionToConfig(undefined);
      expect(result).toEqual({ postSignupMode: "default" });
    });

    it("for undefined expression", () => {
      const result = postSignupExpressionToConfig("undefined");
      expect(result).toEqual({ postSignupMode: "default" });
    });
    it("for empty expression", () => {
      const result = postSignupExpressionToConfig("");
      expect(result).toEqual({ postSignupMode: "default" });
    });

    it("for quoted empty string", () => {
      const result = postSignupExpressionToConfig('""');
      expect(result).toEqual({ postSignupMode: "default" });
    });

    it("for quoted empty string with additional whitespace", () => {
      const result1 = postSignupExpressionToConfig('"   "');
      expect(result1).toEqual({ postSignupMode: "default" });
      const result2 = postSignupExpressionToConfig('    ""    ');
      expect(result2).toEqual({ postSignupMode: "default" });
    });

    it("for new URL expression with empty path", () => {
      const result = postSignupExpressionToConfig(
        'new URL("", window.location.origin).href',
      );
      expect(result).toEqual({ postSignupMode: "default" });
    });

    it("for new URL expression with additional whitespace", () => {
      const result1 = postSignupExpressionToConfig(
        'new URL("    ", window.location.origin).href    ',
      );
      expect(result1).toEqual({ postSignupMode: "default" });
      const result2 = postSignupExpressionToConfig(
        '    new URL("", window.location.origin).href',
      );
      expect(result2).toEqual({ postSignupMode: "default" });
    });

    it("for invalid expressions", () => {
      const result1 = postSignupExpressionToConfig(
        'new URL("/dashboard", window.location.href).href',
      );
      const result2 = postSignupExpressionToConfig(
        '"https://example.com/callback',
      );
      const result3 = postSignupExpressionToConfig("someOtherExpression()");
      const result4 = postSignupExpressionToConfig(
        'window.location.href + "/callback"',
      );
      const result5 = postSignupExpressionToConfig(
        'new URL("/path\\"with\\"quotes", window.location.origin).href',
      );
      const result6 = postSignupExpressionToConfig(
        '"https://example.com/path\\"with\\"quotes"',
      );
      const result7 = postSignupExpressionToConfig("hello()");

      expect(result1).toEqual({ postSignupMode: "default" });
      expect(result2).toEqual({ postSignupMode: "default" });
      expect(result3).toEqual({ postSignupMode: "default" });
      expect(result4).toEqual({ postSignupMode: "default" });
      expect(result5).toEqual({ postSignupMode: "default" });
      expect(result6).toEqual({ postSignupMode: "default" });
      expect(result7).toEqual({ postSignupMode: "default" });
    });

    it("for earlier plugin version ternary expression", () => {
      const result = postSignupExpressionToConfig(
        '"" ? new URL("", window.location.origin).href : undefined',
      );
      expect(result).toEqual({ postSignupMode: "default" });
    });
  });

  describe("message mode", () => {
    it("for null literal", () => {
      const result = postSignupExpressionToConfig("null");
      expect(result).toEqual({ postSignupMode: "message" });
    });

    it("for window.location.href with additional whitespace", () => {
      const result1 = postSignupExpressionToConfig("null    ");
      expect(result1).toEqual({ postSignupMode: "message" });
      const result2 = postSignupExpressionToConfig("    null");
      expect(result2).toEqual({ postSignupMode: "message" });
    });
  });

  describe("page mode", () => {
    it("for new URL expression", () => {
      const result = postSignupExpressionToConfig(
        'new URL("/thanks", window.location.origin).href',
      );
      expect(result).toEqual({
        postSignupMode: "page",
        postSignupPagePath: "/thanks",
      });
    });

    it("for new URL expression with additional whitespace", () => {
      const result = postSignupExpressionToConfig(
        'new URL( "/thanks"    , window.location.origin ).href',
      );
      expect(result).toEqual({
        postSignupMode: "page",
        postSignupPagePath: "/thanks",
      });
    });

    it("for new URL expression with less whitespace", () => {
      const result = postSignupExpressionToConfig(
        'new URL("/thanks",window.location.origin).href',
      );
      expect(result).toEqual({
        postSignupMode: "page",
        postSignupPagePath: "/thanks",
      });
    });

    it("for plugin version 1 expression", () => {
      const result = postSignupExpressionToConfig(
        '"/thanks" ? new URL("/thanks", window.location.origin).href : undefined',
      );
      expect(result).toEqual({
        postSignupMode: "page",
        postSignupPagePath: "/thanks",
      });
    });
  });

  describe("custom mode", () => {
    it("for quoted string", () => {
      expect(postSignupExpressionToConfig('"https://x.y/z"')).toEqual({
        postSignupMode: "custom",
        postSignupCustomUrl: "https://x.y/z",
      });
    });
  });
});
