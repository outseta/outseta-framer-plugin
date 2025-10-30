import { describe, it, expect } from "vitest";
import {
  postSignupConfigToExpression,
  postSignupExpressionToMode,
} from "./script-post-signup";

describe("postSignupConfigToExpression", () => {
  it("default -> null (omit)", () => {
    expect(postSignupConfigToExpression({ mode: "default" })).toBeNull();
  });

  it("message -> undefined literal", () => {
    expect(postSignupConfigToExpression({ mode: "message" })).toBe(
      "undefined",
    );
  });

  it("page -> new URL(...).href", () => {
    expect(
      postSignupConfigToExpression({ mode: "page", path: "/welcome" }),
    ).toBe('new URL("/welcome", window.location.origin).href');
  });

  it("custom -> quoted url", () => {
    expect(
      postSignupConfigToExpression({
        mode: "custom",
        url: "https://example.com/thanks",
      }),
    ).toBe('"https://example.com/thanks"');
  });
});

describe("postSignupExpressionToMode", () => {
  it("undefined -> default", () => {
    expect(postSignupExpressionToMode(undefined)).toEqual({ mode: "default" });
  });

  it("undefined literal -> message", () => {
    expect(postSignupExpressionToMode("undefined")).toEqual({
      mode: "message",
    });
  });

  it("new URL -> page", () => {
    expect(
      postSignupExpressionToMode(
        'new URL("/thanks", window.location.origin).href',
      ),
    ).toEqual({ mode: "page", path: "/thanks" });
  });

  it("quoted -> custom", () => {
    expect(postSignupExpressionToMode('"https://x.y/z"')).toEqual({
      mode: "custom",
      url: "https://x.y/z",
    });
  });
});


