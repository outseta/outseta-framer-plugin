const normalizePath = (path: string) => path.replace(/^\/+|\/+$/g, "");

export const matchesContentGroupPath = (
  pagePath: string | null,
  pattern: string,
  matchMode: number,
): boolean => {
  if (pagePath === null) return false;

  const normalizedPagePath = normalizePath(pagePath);
  const normalizedPattern = normalizePath(pattern);

  switch (matchMode) {
    case 1:
      return normalizedPagePath === normalizedPattern;
    case 2:
      return normalizedPagePath.startsWith(normalizedPattern);
    default:
      return false;
  }
};
