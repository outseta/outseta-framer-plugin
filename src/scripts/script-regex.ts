export const DOMAIN_REGEX = /^\s*['"]?\s*(\S+\.outseta\.com)\s*['"]?\s*$/;
export const CURRENT_MODE_REGEX =
  /^\s*['"]?\s*window\.location\.href\s*['"]?\s*$/;
export const CUSTOM_MODE_REGEX =
  /^\s*['"]?\s*['"]([^'"]*\S[^'"]*)['"]\s*['"]?\s*$/;
export const PAGE_MODE_REGEX =
  /^\s*['"]?\s*new\s+URL\s*\(\s*['"]([^'"]*\S[^'"]*)['"]\s*,\s*window\.location\.origin\s*\)\s*\.href\s*['"]?\s*$/;
export const MESSAGE_MODE_REGEX = /^\s*['"]?\s*null\s*['"]?\s*$/;

/** Earlier plugin version ternary expressions (check before direct patterns)
 * These are used to match the ternary expressions in the plugin version 1 script.
 * They are used to determine the mode of the post login or post signup configuration.
 */

// Matches: "" ? new URL("", window.location.origin).href : window.location.href
export const CURRENT_MODE_TERNARY_REGEX =
  /^\s*['"]?\s*['"]\s*['"]\s*\?\s*new\s+URL\s*\(\s*['"]\s*['"]\s*,\s*window\.location\.origin\s*\)\s*\.href\s*:\s*window\.location\.href\s*$/;

// Matches: "/path" ? new URL("/path", window.location.origin).href : window.location.href
export const PAGE_MODE_TERNARY_REGEX =
  /^\s*['"]?\s*['"]([^'"]*\S[^'"]*)['"]\s*\?\s*new\s+URL\s*\(\s*['"]([^'"]*\S[^'"]*)['"]\s*,\s*window\.location\.origin\s*\)\s*\.href\s*:\s*window\.location\.href\s*$/;

// Matches: "/path" ? new URL("/path", window.location.origin).href : undefined
export const PAGE_MODE_TERNARY_UNDEFINED_REGEX =
  /^\s*['"]?\s*['"]([^'"]*\S[^'"]*)['"]\s*\?\s*new\s+URL\s*\(\s*['"]([^'"]*\S[^'"]*)['"]\s*,\s*window\.location\.origin\s*\)\s*\.href\s*:\s*undefined\s*$/;

// Matches: "" ? new URL("", window.location.origin).href : undefined
export const DEFAULT_MODE_TERNARY_REGEX =
  /^\s*['"]?\s*['"]\s*['"]\s*\?\s*new\s+URL\s*\(\s*['"]\s*['"]\s*,\s*window\.location\.origin\s*\)\s*\.href\s*:\s*undefined\s*$/;
