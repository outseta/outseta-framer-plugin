// Convert a JavaScript expression back to a domain string.
export const expressionToDomain = (
  expression: string = "",
): string | undefined => {
  const customMatch = expression.match(/^["']([^"']+)["']$/);
  if (!customMatch) {
    // If empty string expression for instance, return undefined
    return undefined;
  }
  return customMatch[1];
};

// Convert a domain string to a JavaScript expression.
export const domainToExpression = (domain: string): string => {
  return `'${domain}'`;
};
