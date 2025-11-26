export const DOMAIN_REGEX = /^\s*['"]?\s*(\S+\.outseta\.com)\s*['"]?\s*$/;
export const CURRENT_MODE_REGEX =
  /^\s*['"]?\s*window\.location\.href\s*['"]?\s*$/;
export const CUSTOM_MODE_REGEX =
  /^\s*['"]?\s*['"]([^'"]*\S[^'"]*)['"]\s*['"]?\s*$/;
export const PAGE_MODE_REGEX =
  /^\s*['"]?\s*new\s+URL\s*\(\s*['"]([^'"]*\S[^'"]*)['"]\s*,\s*window\.location\.origin\s*\)\s*\.href\s*['"]?\s*$/;
export const MESSAGE_MODE_REGEX = /^\s*['"]?\s*null\s*['"]?\s*$/;
