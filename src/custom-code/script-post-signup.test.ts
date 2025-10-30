import { describe, it, expect } from "vitest";
import {
  postSignupConfigToExpression,
  postSignupExpressionToMode,
  type PostSignupConfig,
} from "./script-post-signup";

describe("postSignupConfigToExpression", () => {
  describe("default mode", () => {
    it("returns undefined literal", () => {
      const config: PostSignupConfig = { mode: "default" };
      const result = postSignupConfigToExpression(config);
      expect(result).toBe("undefined");
    });
  });

  describe("message mode", () => {
    it("returns null literal", () => {
      const config: PostSignupConfig = { mode: "message" };
      const result = postSignupConfigToExpression(config);
      expect(result).toBe("null");
    });
  });

  describe("page mode", () => {
    it("returns new URL expression with path", () => {
      const config: PostSignupConfig = { mode: "page", path: "/welcome" };
      const result = postSignupConfigToExpression(config);
      expect(result).toBe('new URL("/welcome", window.location.origin).href');
    });

    it("returns new URL expression for empty path", () => {
      const config: PostSignupConfig = { mode: "page", path: "" };
      const result = postSignupConfigToExpression(config);
      expect(result).toBe('new URL("", window.location.origin).href');
    });
  });

  describe("custom mode", () => {
    it("returns quoted string", () => {
      const config: PostSignupConfig = {
        mode: "custom",
        url: "https://example.com/thanks",
      };
      const result = postSignupConfigToExpression(config);
      expect(result).toBe('"https://example.com/thanks"');
    });

    it("returns quoted empty string for empty url", () => {
      const config: PostSignupConfig = { mode: "custom", url: "" };
      const result = postSignupConfigToExpression(config);
      expect(result).toBe('""');
    });
  });
});

describe("postSignupExpressionToMode", () => {
  describe("default mode", () => {
    it("for undefined literal", () => {
      expect(postSignupExpressionToMode("undefined")).toEqual({
        mode: "default",
      });
    });
    it("for empty expression", () => {
      const result = postSignupExpressionToMode("");
      expect(result).toEqual({ mode: "default" });
    });

    it("for quoted empty string", () => {
      const result = postSignupExpressionToMode('""');
      expect(result).toEqual({ mode: "default" });
    });

    it("for quoted empty string with additional whitespace", () => {
      const result1 = postSignupExpressionToMode('"   "');
      expect(result1).toEqual({ mode: "default" });
      const result2 = postSignupExpressionToMode('    ""    ');
      expect(result2).toEqual({ mode: "default" });
    });

    it("for new URL expression with empty path", () => {
      const result = postSignupExpressionToMode(
        'new URL("", window.location.origin).href',
      );
      expect(result).toEqual({ mode: "default" });
    });

    it("for new URL expression with additional whitespace", () => {
      const result1 = postSignupExpressionToMode(
        'new URL("    ", window.location.origin).href    ',
      );
      expect(result1).toEqual({ mode: "default" });
      const result2 = postSignupExpressionToMode(
        '    new URL("", window.location.origin).href',
      );
      expect(result2).toEqual({ mode: "default" });
    });

    it("for invalid expressions", () => {
      const result1 = postSignupExpressionToMode(
        'new URL("/dashboard", window.location.href).href',
      );
      const result2 = postSignupExpressionToMode(
        '"https://example.com/callback',
      );
      const result3 = postSignupExpressionToMode("someOtherExpression()");
      const result4 = postSignupExpressionToMode(
        'window.location.href + "/callback"',
      );
      const result5 = postSignupExpressionToMode(
        'new URL("/path\\"with\\"quotes", window.location.origin).href',
      );
      const result6 = postSignupExpressionToMode(
        '"https://example.com/path\\"with\\"quotes"',
      );
      const result7 = postSignupExpressionToMode("hello()");

      expect(result1).toEqual({ mode: "default" });
      expect(result2).toEqual({ mode: "default" });
      expect(result3).toEqual({ mode: "default" });
      expect(result4).toEqual({ mode: "default" });
      expect(result5).toEqual({ mode: "default" });
      expect(result6).toEqual({ mode: "default" });
      expect(result7).toEqual({ mode: "default" });
    });
  });

  describe("message mode", () => {
    it("for null literal", () => {
      const result = postSignupExpressionToMode("null");
      expect(result).toEqual({ mode: "message" });
    });

    it("for window.location.href with additional whitespace", () => {
      const result1 = postSignupExpressionToMode("null    ");
      expect(result1).toEqual({ mode: "message" });
      const result2 = postSignupExpressionToMode("    null");
      expect(result2).toEqual({ mode: "message" });
    });
  });

  describe("page mode", () => {
    it("for new URL expression", () => {
      const result = postSignupExpressionToMode(
        'new URL("/thanks", window.location.origin).href',
      );
      expect(result).toEqual({ mode: "page", path: "/thanks" });
    });

    it("for new URL expression with additional whitespace", () => {
      const result = postSignupExpressionToMode(
        'new URL( "/thanks"    , window.location.origin ).href',
      );
      expect(result).toEqual({ mode: "page", path: "/thanks" });
    });

    it("for new URL expression with less whitespace", () => {
      const result = postSignupExpressionToMode(
        'new URL("/thanks",window.location.origin).href',
      );
      expect(result).toEqual({ mode: "page", path: "/thanks" });
    });
  });

  describe("custom mode", () => {
    it("for quoted string", () => {
      expect(postSignupExpressionToMode('"https://x.y/z"')).toEqual({
        mode: "custom",
        url: "https://x.y/z",
      });
    });
  });
});
