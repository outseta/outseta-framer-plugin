import { describe, it, expect } from "vitest";
import {
  expressionToDomainConfig,
  domainConfigToExpression,
  DEFAULT_DOMAIN_CONFIG,
} from "./script-domain";

describe("expressionToDomain", () => {
  it("should convert valid expression to a domain string", () => {
    const expression1 = "'myapp.outseta.com'";
    const config1 = expressionToDomainConfig(expression1);
    expect(config1).toEqual({ domain: "myapp.outseta.com" });

    const expression2 = '"my-app-6.outseta.com"';
    const config2 = expressionToDomainConfig(expression2);
    expect(config2).toEqual({ domain: "my-app-6.outseta.com" });
  });

  it("should allow for additional whitespace", () => {
    const expression1 = "'myapp.outseta.com    '";
    const config1 = expressionToDomainConfig(expression1);
    expect(config1).toEqual({ domain: "myapp.outseta.com" });

    const expression2 = '"   myapp.outseta.com"';
    const config2 = expressionToDomainConfig(expression2);
    expect(config2).toEqual({ domain: "myapp.outseta.com" });
  });
  it("should return default config for invalid expression", () => {
    const expression1 = "'myapp.somedomain.com'";
    const config1 = expressionToDomainConfig(expression1);
    expect(config1).toEqual(DEFAULT_DOMAIN_CONFIG);

    const expression2 = '""';
    const config2 = expressionToDomainConfig(expression2);
    expect(config2).toEqual(DEFAULT_DOMAIN_CONFIG);

    const expression3 = '"hello hello"';
    const config3 = expressionToDomainConfig(expression3);
    expect(config3).toEqual(DEFAULT_DOMAIN_CONFIG);

    const expression4 = "   ";
    const config4 = expressionToDomainConfig(expression4);
    expect(config4).toEqual(DEFAULT_DOMAIN_CONFIG);

    const expression5 = '"myapp    .outseta.com"';
    const config5 = expressionToDomainConfig(expression5);
    expect(config5).toEqual(DEFAULT_DOMAIN_CONFIG);

    const expression6 = "undefined";
    const config6 = expressionToDomainConfig(expression6);
    expect(config6).toEqual(DEFAULT_DOMAIN_CONFIG);
  });
});

describe("domainToExpression", () => {
  it("should convert a valid domain string to a string expression", () => {
    const expression1 = domainConfigToExpression({
      domain: "myapp.outseta.com",
    });
    expect(expression1).toBe('"myapp.outseta.com"');

    const expression2 = domainConfigToExpression({
      domain: "my-app-6.outseta.com",
    });
    expect(expression2).toBe('"my-app-6.outseta.com"');
  });

  it("should allow for additional whitespace and quotes", () => {
    const expression1 = domainConfigToExpression({
      domain: "myapp.outseta.com",
    });
    expect(expression1).toBe('"myapp.outseta.com"');

    const expression2 = domainConfigToExpression({
      domain: "myapp.outseta.com",
    });
    expect(expression2).toBe('"myapp.outseta.com"');
  });
  it("should return empty string expression for invalid domain", () => {
    const expression1 = domainConfigToExpression({
      domain: "myapp.somedomain.com",
    });
    expect(expression1).toBe('""');

    const expression2 = domainConfigToExpression({ domain: "" });
    expect(expression2).toBe('""');

    const expression3 = domainConfigToExpression({ domain: "    " });
    expect(expression3).toBe('""');

    const expression5 = domainConfigToExpression({ domain: "undefined" });
    expect(expression5).toBe('""');
  });
});
