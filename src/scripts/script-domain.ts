import { DOMAIN_REGEX } from "./script-regex";
import { z } from "zod";
export const domainSchema = z.object({
  domain: z
    .hostname("An Outseta domain is required")
    .endsWith(".outseta.com", "An Outseta domain is required"),
});

export type DomainConfig = z.infer<typeof domainSchema>;

export const DEFAULT_DOMAIN_CONFIG: DomainConfig = {
  domain: "",
};

// Convert a domain string to a JavaScript expression.
export const domainConfigToExpression = ({
  domain,
}: DomainConfig = DEFAULT_DOMAIN_CONFIG): string => {
  const domainMatch = domain.match(DOMAIN_REGEX);
  if (domainMatch) {
    return JSON.stringify(domainMatch[1]);
  }
  // Fallback to empty string expression
  return JSON.stringify("");
};

// Convert a JavaScript expression back to a domain string.
export const expressionToDomainConfig = (
  expression: string = "",
): DomainConfig => {
  // Capture the domain string, requiring format: project.outseta.com
  const domainMatch = expression.match(DOMAIN_REGEX);
  if (domainMatch) {
    // Return the domain string
    return { domain: domainMatch[1] };
  }

  // Fallback to default
  return DEFAULT_DOMAIN_CONFIG;
};
