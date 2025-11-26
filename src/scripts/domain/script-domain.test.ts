import { describe, it, expect } from "vitest";
import { expressionToDomain, domainToExpression } from "./script-domain";

describe("expressionToDomain", () => {
  it("should convert valid expression to a domain string", () => {
    const expression1 = "'myapp.outseta.com'";
    const domain1 = expressionToDomain(expression1);
    expect(domain1).toBe("myapp.outseta.com");

    const expression2 = '"my-app-6.outseta.com"';
    const domain2 = expressionToDomain(expression2);
    expect(domain2).toBe("my-app-6.outseta.com");
  });

  it("should allow for additional whitespace", () => {
    const expression1 = "'myapp.outseta.com    '";
    const domain1 = expressionToDomain(expression1);
    expect(domain1).toBe("myapp.outseta.com");

    const expression2 = '"   myapp.outseta.com"';
    const domain2 = expressionToDomain(expression2);
    expect(domain2).toBe("myapp.outseta.com");
  });
  it("should return undefined for invalid expression", () => {
    const expression1 = "'myapp.somedomain.com'";
    const domain1 = expressionToDomain(expression1);
    expect(domain1).toBe(undefined);

    const expression2 = '""';
    const domain2 = expressionToDomain(expression2);
    expect(domain2).toBe(undefined);

    const expression3 = '"hello hello"';
    const domain3 = expressionToDomain(expression3);
    expect(domain3).toBe(undefined);

    const expression4 = "   ";
    const domain4 = expressionToDomain(expression4);
    expect(domain4).toBe(undefined);

    const expression5 = '"myapp    .outseta.com"';
    const domain5 = expressionToDomain(expression5);
    expect(domain5).toBe(undefined);

    const expression6 = "undefined";
    const domain6 = expressionToDomain(expression6);
    expect(domain6).toBe(undefined);
  });
});

describe("domainToExpression", () => {
  it("should convert a valid domain string to a string expression", () => {
    const domain1 = "myapp.outseta.com";
    const expression1 = domainToExpression(domain1);
    expect(expression1).toBe('"myapp.outseta.com"');

    const domain2 = "my-app-6.outseta.com";
    const expression2 = domainToExpression(domain2);
    expect(expression2).toBe('"my-app-6.outseta.com"');
  });

  it("should allow for additional whitespace and quotes", () => {
    const expression1 = "myapp.outseta.com    ";
    const domain1 = domainToExpression(expression1);
    expect(domain1).toBe('"myapp.outseta.com"');

    const expression2 = '"   myapp.outseta.com"';
    const domain2 = domainToExpression(expression2);
    expect(domain2).toBe('"myapp.outseta.com"');
  });
  it("should return undefined for invalid domain", () => {
    const domain1 = "myapp.somedomain.com";
    const expression1 = domainToExpression(domain1);
    expect(expression1).toBe(undefined);

    const domain2 = "";
    const expression2 = domainToExpression(domain2);
    expect(expression2).toBe(undefined);

    const domain3 = "    ";
    const expression3 = domainToExpression(domain3);
    expect(expression3).toBe(undefined);

    const domain4 = undefined;
    const expression4 = domainToExpression(domain4);
    expect(expression4).toBe(undefined);

    const domain5 = "undefined";
    const expression5 = domainToExpression(domain5);
    expect(expression5).toBe(undefined);
  });
});
