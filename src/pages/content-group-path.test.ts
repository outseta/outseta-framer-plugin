import { describe, expect, it } from "vitest";
import { matchesContentGroupPath } from "./content-group-path";

describe("matchesContentGroupPath", () => {
  it("matches equal relative paths with or without slashes", () => {
    expect(matchesContentGroupPath("test-pierre", "test-pierre", 1)).toBe(true);
    expect(matchesContentGroupPath("/test-pierre/", "test-pierre", 1)).toBe(
      true,
    );
  });

  it("matches paths using starts-with mode", () => {
    expect(matchesContentGroupPath("docs/getting-started", "/docs", 2)).toBe(
      true,
    );
  });

  it("rejects missing paths and unsupported modes", () => {
    expect(matchesContentGroupPath(null, "test-pierre", 1)).toBe(false);
    expect(matchesContentGroupPath("test-pierre", "test-pierre", 3)).toBe(
      false,
    );
  });
});
