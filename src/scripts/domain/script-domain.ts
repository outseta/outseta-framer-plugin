import { DOMAIN_REGEX } from "../script-regex";

// Convert a JavaScript expression back to a domain string.
export const expressionToDomain = (
  expression: string = "",
): string | undefined => {
  // Capture the domain string, requiring format: project.outseta.com
  const domainMatch = expression.match(DOMAIN_REGEX);
  if (domainMatch) {
    return domainMatch[1];
  }

  return undefined;
};

// Convert a domain string to a JavaScript expression.
export const domainToExpression = (domain: string = ""): string | undefined => {
  const domainMatch = domain.match(DOMAIN_REGEX);
  if (domainMatch) {
    return JSON.stringify(domainMatch[1]);
  }
  return undefined;
};
