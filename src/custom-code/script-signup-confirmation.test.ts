import { describe, it, expect } from "vitest";
import {
  signupConfirmationConfigToExpression,
  signupConfirmationExpressionToMode,
  defaultSignupConfirmationConfig,
} from "./script-signup-confirmation";

describe("signupConfirmationConfigToExpression", () => {
  it("should return undefined for default mode", () => {
    const config = { signupConfirmationMode: "default" as const };
    const result = signupConfirmationConfigToExpression(config);
    expect(result).toBe(undefined);
  });

  it("should return window.location.href for current mode", () => {
    const config = { signupConfirmationMode: "current" as const };
    const result = signupConfirmationConfigToExpression(config);
    expect(result).toBe("window.location.href");
  });

  it("should return new URL expression for page mode", () => {
    const config = {
      signupConfirmationMode: "page" as const,
      signupConfirmationPagePath: "/dashboard",
    };
    const result = signupConfirmationConfigToExpression(config);
    expect(result).toBe(
      'new URL("/dashboard", window.location.origin).href',
    );
  });

  it("should return quoted URL for custom mode with absolute URL", () => {
    const config = {
      signupConfirmationMode: "custom" as const,
      signupConfirmationCustomUrl: "https://example.com/signup-confirmed",
    };
    const result = signupConfirmationConfigToExpression(config);
    expect(result).toBe('"https://example.com/signup-confirmed"');
  });

  it("should handle page mode with complex paths", () => {
    const config = {
      signupConfirmationMode: "page" as const,
      signupConfirmationPagePath: "/welcome/user",
    };
    const result = signupConfirmationConfigToExpression(config);
    expect(result).toBe(
      'new URL("/welcome/user", window.location.origin).href',
    );
  });
});

describe("signupConfirmationExpressionToMode", () => {
  describe("default mode", () => {
    it("should parse empty expression as default mode", () => {
      const result = signupConfirmationExpressionToMode("");
      expect(result).toEqual({ signupConfirmationMode: "default" });
    });

    it("should parse undefined as default mode", () => {
      const result = signupConfirmationExpressionToMode(undefined);
      expect(result).toEqual({ signupConfirmationMode: "default" });
    });

    it("should parse whitespace as default mode", () => {
      const result = signupConfirmationExpressionToMode("   ");
      expect(result).toEqual({ signupConfirmationMode: "default" });
    });

    it("should parse invalid expression as default mode", () => {
      const result = signupConfirmationExpressionToMode("invalidExpression");
      expect(result).toEqual({ signupConfirmationMode: "default" });
    });
  });

  describe("current mode", () => {
    it("should parse window.location.href as current mode", () => {
      const result = signupConfirmationExpressionToMode("window.location.href");
      expect(result).toEqual({ signupConfirmationMode: "current" });
    });

    it("should parse window.location.href with extra whitespace", () => {
      const result = signupConfirmationExpressionToMode(
        "  window.location.href  ",
      );
      expect(result).toEqual({ signupConfirmationMode: "current" });
    });

    it("should parse window.location.href with quotes", () => {
      const result = signupConfirmationExpressionToMode(
        '"window.location.href"',
      );
      expect(result).toEqual({ signupConfirmationMode: "current" });
    });
  });

  describe("page mode", () => {
    it("should parse new URL expression as page mode", () => {
      const expression =
        'new URL("/dashboard", window.location.origin).href';
      const result = signupConfirmationExpressionToMode(expression);
      expect(result).toEqual({
        signupConfirmationMode: "page",
        signupConfirmationPagePath: "/dashboard",
      });
    });

    it("should parse new URL expression with whitespace", () => {
      const expression =
        '  new URL("/welcome", window.location.origin).href  ';
      const result = signupConfirmationExpressionToMode(expression);
      expect(result).toEqual({
        signupConfirmationMode: "page",
        signupConfirmationPagePath: "/welcome",
      });
    });

    it("should parse new URL with complex path", () => {
      const expression =
        'new URL("/path/to/page", window.location.origin).href';
      const result = signupConfirmationExpressionToMode(expression);
      expect(result).toEqual({
        signupConfirmationMode: "page",
        signupConfirmationPagePath: "/path/to/page",
      });
    });

    it("should handle weird whitespace in new URL expression", () => {
      const expression =
        'new        URL("/dashboard", window.location.origin).href';
      const result = signupConfirmationExpressionToMode(expression);
      expect(result).toEqual({
        signupConfirmationMode: "page",
        signupConfirmationPagePath: "/dashboard",
      });
    });
  });

  describe("custom mode", () => {
    it("should parse quoted absolute URL as custom mode", () => {
      const expression = '"https://example.com/signup-confirmed"';
      const result = signupConfirmationExpressionToMode(expression);
      expect(result).toEqual({
        signupConfirmationMode: "custom",
        signupConfirmationCustomUrl: "https://example.com/signup-confirmed",
      });
    });

    it("should parse single-quoted URL as custom mode", () => {
      const expression = "'https://mysite.com/welcome'";
      const result = signupConfirmationExpressionToMode(expression);
      expect(result).toEqual({
        signupConfirmationMode: "custom",
        signupConfirmationCustomUrl: "https://mysite.com/welcome",
      });
    });

    it("should parse custom URL with whitespace", () => {
      const expression = '  "https://example.com/page"  ';
      const result = signupConfirmationExpressionToMode(expression);
      expect(result).toEqual({
        signupConfirmationMode: "custom",
        signupConfirmationCustomUrl: "https://example.com/page",
      });
    });

    it("should handle custom URL with trailing spaces inside quotes", () => {
      const expression = '    "https://example.com/callback"';
      const result = signupConfirmationExpressionToMode(expression);
      expect(result).toEqual({
        signupConfirmationMode: "custom",
        signupConfirmationCustomUrl: "https://example.com/callback",
      });
    });
  });
});

describe("defaultSignupConfirmationConfig", () => {
  it("should have default mode as the default configuration", () => {
    expect(defaultSignupConfirmationConfig).toEqual({
      signupConfirmationMode: "default",
    });
  });
});

describe("round-trip conversion", () => {
  it("should preserve default mode through conversion", () => {
    const config = { signupConfirmationMode: "default" as const };
    const expression = signupConfirmationConfigToExpression(config);
    const restored = signupConfirmationExpressionToMode(expression || "");
    expect(restored).toEqual(config);
  });

  it("should preserve current mode through conversion", () => {
    const config = { signupConfirmationMode: "current" as const };
    const expression = signupConfirmationConfigToExpression(config);
    const restored = signupConfirmationExpressionToMode(expression!);
    expect(restored).toEqual(config);
  });

  it("should preserve page mode through conversion", () => {
    const config = {
      signupConfirmationMode: "page" as const,
      signupConfirmationPagePath: "/dashboard",
    };
    const expression = signupConfirmationConfigToExpression(config);
    const restored = signupConfirmationExpressionToMode(expression!);
    expect(restored).toEqual(config);
  });

  it("should preserve custom mode through conversion", () => {
    const config = {
      signupConfirmationMode: "custom" as const,
      signupConfirmationCustomUrl: "https://example.com/confirm",
    };
    const expression = signupConfirmationConfigToExpression(config);
    const restored = signupConfirmationExpressionToMode(expression!);
    expect(restored).toEqual(config);
  });
});
