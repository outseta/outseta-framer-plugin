import { describe, it, expect } from "vitest";
import {
  postSignupConfigToExpression,
  postSignupExpressionToMode,
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

describe("postSignupExpressionToMode", () => {
  describe("default mode", () => {
    it("for undefined", () => {
      const result = postSignupExpressionToMode(undefined);
      expect(result).toEqual({ postSignupMode: "default" });
    });

    it("for undefined expression", () => {
      const result = postSignupExpressionToMode("undefined");
      expect(result).toEqual({ postSignupMode: "default" });
    });
    it("for empty expression", () => {
      const result = postSignupExpressionToMode("");
      expect(result).toEqual({ postSignupMode: "default" });
    });

    it("for quoted empty string", () => {
      const result = postSignupExpressionToMode('""');
      expect(result).toEqual({ postSignupMode: "default" });
    });

    it("for quoted empty string with additional whitespace", () => {
      const result1 = postSignupExpressionToMode('"   "');
      expect(result1).toEqual({ postSignupMode: "default" });
      const result2 = postSignupExpressionToMode('    ""    ');
      expect(result2).toEqual({ postSignupMode: "default" });
    });

    it("for new URL expression with empty path", () => {
      const result = postSignupExpressionToMode(
        'new URL("", window.location.origin).href',
      );
      expect(result).toEqual({ postSignupMode: "default" });
    });

    it("for new URL expression with additional whitespace", () => {
      const result1 = postSignupExpressionToMode(
        'new URL("    ", window.location.origin).href    ',
      );
      expect(result1).toEqual({ postSignupMode: "default" });
      const result2 = postSignupExpressionToMode(
        '    new URL("", window.location.origin).href',
      );
      expect(result2).toEqual({ postSignupMode: "default" });
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

      expect(result1).toEqual({ postSignupMode: "default" });
      expect(result2).toEqual({ postSignupMode: "default" });
      expect(result3).toEqual({ postSignupMode: "default" });
      expect(result4).toEqual({ postSignupMode: "default" });
      expect(result5).toEqual({ postSignupMode: "default" });
      expect(result6).toEqual({ postSignupMode: "default" });
      expect(result7).toEqual({ postSignupMode: "default" });
    });
  });

  describe("message mode", () => {
    it("for null literal", () => {
      const result = postSignupExpressionToMode("null");
      expect(result).toEqual({ postSignupMode: "message" });
    });

    it("for window.location.href with additional whitespace", () => {
      const result1 = postSignupExpressionToMode("null    ");
      expect(result1).toEqual({ postSignupMode: "message" });
      const result2 = postSignupExpressionToMode("    null");
      expect(result2).toEqual({ postSignupMode: "message" });
    });
  });

  describe("page mode", () => {
    it("for new URL expression", () => {
      const result = postSignupExpressionToMode(
        'new URL("/thanks", window.location.origin).href',
      );
      expect(result).toEqual({
        postSignupMode: "page",
        postSignupPagePath: "/thanks",
      });
    });

    it("for new URL expression with additional whitespace", () => {
      const result = postSignupExpressionToMode(
        'new URL( "/thanks"    , window.location.origin ).href',
      );
      expect(result).toEqual({
        postSignupMode: "page",
        postSignupPagePath: "/thanks",
      });
    });

    it("for new URL expression with less whitespace", () => {
      const result = postSignupExpressionToMode(
        'new URL("/thanks",window.location.origin).href',
      );
      expect(result).toEqual({
        postSignupMode: "page",
        postSignupPagePath: "/thanks",
      });
    });
  });

  describe("custom mode", () => {
    it("for quoted string", () => {
      expect(postSignupExpressionToMode('"https://x.y/z"')).toEqual({
        postSignupMode: "custom",
        postSignupCustomUrl: "https://x.y/z",
      });
    });
  });
});
