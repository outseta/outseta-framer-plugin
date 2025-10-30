import { describe, it, expect } from "vitest";
import { parseOutsetaScript, createOutsetaScript } from "./script";

describe("parseOutsetaScript", () => {
  it("should parse a complete Outseta script with all properties", () => {
    const script = `
      <script>
        var o_options = {
          domain: 'test.outseta.com',
          load: "auth,profile,nocode,leadCapture,support,emailList",
          monitorDom: true,
          auth: {
            authenticationCallbackUrl: "https://example.com/callback",
            registrationConfirmationUrl: window.location.href,
            postRegistrationUrl: 'https://example.com/welcome'
          },
          nocode: {
            clearQuerystring: true
          }
        };
      </script>
    `;

    const result = parseOutsetaScript(script);

    expect(result.domainExpression).toBe("'test.outseta.com'");
    expect(result.authCallbackExpression).toBe(
      '"https://example.com/callback"',
    );
    expect(result.postSignupExpression).toBe("'https://example.com/welcome'");
  });

  it("should parse script with only domain", () => {
    const script = `
      <script>
        var o_options = {
          domain: 'myapp.outseta.com',
          load: 'auth,profile',
        };
      </script>
    `;

    const result = parseOutsetaScript(script);

    expect(result.domainExpression).toBe("'myapp.outseta.com'");
    expect(result.authCallbackExpression).toBeUndefined();
    expect(result.postSignupExpression).toBeUndefined();
  });

  it("should parse script with domain and authCallbackUrl but no postSignupPath", () => {
    const script = `
      <script>
        var o_options = {
          domain: "app.outseta.com",
          auth: {
            authenticationCallbackUrl: 'https://myapp.com/auth/callback',
          }
        };
      </script>
    `;

    const result = parseOutsetaScript(script);

    expect(result.domainExpression).toBe('"app.outseta.com"');
    expect(result.authCallbackExpression).toBe(
      "'https://myapp.com/auth/callback'",
    );
    expect(result.postSignupExpression).toBeUndefined();
  });

  it("should parse script with domain and postSignupPath but no authCallbackUrl", () => {
    const script = `
      <script>
        var o_options = {
          domain: 'app.outseta.com',
          auth: {
            postRegistrationUrl: "https://myapp.com/welcome"
          }
        };
      </script>
    `;

    const result = parseOutsetaScript(script);

    expect(result.domainExpression).toBe("'app.outseta.com'");
    expect(result.authCallbackExpression).toBeUndefined();
    expect(result.postSignupExpression).toBe('"https://myapp.com/welcome"');
  });

  it("should handle authCallbackUrl with whitespace", () => {
    const script = `
      <script>
        var o_options = {
          domain: 'test.outseta.com',
          auth: {
            authenticationCallbackUrl: '  https://example.com/callback  ',
          }
        };
      </script>
    `;

    const result = parseOutsetaScript(script);

    expect(result.authCallbackExpression).toBe(
      "'  https://example.com/callback  '",
    );
  });

  it("should handle authCallbackUrl without comma separator", () => {
    const script = `
      <script>
        var o_options = {
          domain: 'test.outseta.com',
          auth: {
            authenticationCallbackUrl: 'https://example.com/callback'
          }
        };
      </script>
    `;

    const result = parseOutsetaScript(script);

    expect(result.authCallbackExpression).toBe(
      "'https://example.com/callback'",
    );
  });

  it("should return undefined for missing properties", () => {
    const script = `
      <script>
        var o_options = {
          load: 'auth,profile'
        };
      </script>
    `;

    const result = parseOutsetaScript(script);

    expect(result.domainExpression).toBeUndefined();
    expect(result.authCallbackExpression).toBeUndefined();
    expect(result.postSignupExpression).toBeUndefined();
  });

  it("should handle empty script", () => {
    const result = parseOutsetaScript("");

    expect(result.domainExpression).toBeUndefined();
    expect(result.authCallbackExpression).toBeUndefined();
    expect(result.postSignupExpression).toBeUndefined();
  });

  it("should handle script with no Outseta configuration", () => {
    const script = `
      <script>
        console.log('Hello world');
      </script>
    `;

    const result = parseOutsetaScript(script);

    expect(result.domainExpression).toBeUndefined();
    expect(result.authCallbackExpression).toBeUndefined();
    expect(result.postSignupPath).toBeUndefined();
  });

  it("should handle malformed script gracefully", () => {
    const script = `
      <script>
        var o_options = {
          domain: 'test.outseta.com',
          auth: {
            // Missing closing quote
            authenticationCallbackUrl: 'https://example.com/callback
            // Missing postRegistrationUrl entirely
          }
        };
      </script>
    `;

    const result = parseOutsetaScript(script);

    // Should still extract what it can
    expect(result.domainExpression).toBe("'test.outseta.com'");
    expect(result.authCallbackExpression).toBeUndefined();
    expect(result.postSignupPath).toBeUndefined();
  });

  it("should parse authenticationCallbackUrl with new URL expression", () => {
    const script = `
      <script>
        var o_options = {
          domain: 'test.outseta.com',
          auth: {
            authenticationCallbackUrl: new URL("/404", window.location.origin).href,
          }
        };
      </script>
    `;

    const result = parseOutsetaScript(script);

    expect(result.authCallbackExpression).toBe(
      'new URL("/404", window.location.origin).href',
    );
  });
});

describe("createOutsetaScript", () => {
  it("should create script with all properties", () => {
    const config = {
      domainExpression: "'test.outseta.com'",
      authCallbackExpression: '"https://example.com/callback"',
      postSignupExpression: 'new URL("/welcome", window.location.origin).href',
    };

    const result = createOutsetaScript(config);

    expect(result).toBe(`
        <script>
          var o_options = {
            domain: 'test.outseta.com',
            load: 'auth,profile,nocode,leadCapture,support,emailList',
            monitorDom: 'true',
            auth: {
              // Override the Post Login URL configured in Outseta
              authenticationCallbackUrl: "https://example.com/callback",

              // Overrides the Signup Confirmation URL
              registrationConfirmationUrl: window.location.href,
              // Override the Post Signup URL or signup embed's post signup message
              postRegistrationUrl: new URL("/welcome", window.location.origin).href,
            },
            nocode: {
              // Nice to clean up the url so the access token is less visible
              clearQuerystring: true
            }
          };
        </script>
        <script src="https://cdn.outseta.com/outseta.min.js" data-options="o_options"></script>
      `);
  });

  it("should create script with only domain", () => {
    const config = {
      domainExpression: "'myapp.outseta.com'",
    };

    const result = createOutsetaScript(config);

    expect(result).toBe(`
        <script>
          var o_options = {
            domain: 'myapp.outseta.com',
            load: 'auth,profile,nocode,leadCapture,support,emailList',
            monitorDom: 'true',
            auth: {
              // Use the Post Login URL configured in Outseta
              authenticationCallbackUrl: undefined,

              // Overrides the Signup Confirmation URL
              registrationConfirmationUrl: window.location.href,

            },
            nocode: {
              // Nice to clean up the url so the access token is less visible
              clearQuerystring: true
            }
          };
        </script>
        <script src="https://cdn.outseta.com/outseta.min.js" data-options="o_options"></script>
      `);
  });

  it("should create script with domain and authCallbackUrl", () => {
    const config = {
      domainExpression: "'app.outseta.com'",
      authCallbackExpression: '"https://myapp.com/auth/callback"',
    };

    const result = createOutsetaScript(config);

    expect(result).toBe(`
        <script>
          var o_options = {
            domain: 'app.outseta.com',
            load: 'auth,profile,nocode,leadCapture,support,emailList',
            monitorDom: 'true',
            auth: {
              // Override the Post Login URL configured in Outseta
              authenticationCallbackUrl: "https://myapp.com/auth/callback",

              // Overrides the Signup Confirmation URL
              registrationConfirmationUrl: window.location.href,

            },
            nocode: {
              // Nice to clean up the url so the access token is less visible
              clearQuerystring: true
            }
          };
        </script>
        <script src="https://cdn.outseta.com/outseta.min.js" data-options="o_options"></script>
      `);
  });

  it("should create script with domain and postSignupExpression (page)", () => {
    const config = {
      domainExpression: "'app.outseta.com'",
      postSignupExpression: 'new URL("/dashboard", window.location.origin).href',
    };

    const result = createOutsetaScript(config);

    expect(result).toBe(`
        <script>
          var o_options = {
            domain: 'app.outseta.com',
            load: 'auth,profile,nocode,leadCapture,support,emailList',
            monitorDom: 'true',
            auth: {
              // Use the Post Login URL configured in Outseta
              authenticationCallbackUrl: undefined,

              // Overrides the Signup Confirmation URL
              registrationConfirmationUrl: window.location.href,
              // Override the Post Signup URL or signup embed's post signup message
              postRegistrationUrl: new URL("/dashboard", window.location.origin).href,
            },
            nocode: {
              // Nice to clean up the url so the access token is less visible
              clearQuerystring: true
            }
          };
        </script>
        <script src="https://cdn.outseta.com/outseta.min.js" data-options="o_options"></script>
      `);
  });

  it("should omit postRegistrationUrl when no expression is provided", () => {
    const config = {
      domainExpression: "'test.outseta.com'",
      // no postSignupExpression -> omitted
    };

    const result = createOutsetaScript(config);

    expect(result).toBe(`
        <script>
          var o_options = {
            domain: 'test.outseta.com',
            load: 'auth,profile,nocode,leadCapture,support,emailList',
            monitorDom: 'true',
            auth: {
              // Use the Post Login URL configured in Outseta
              authenticationCallbackUrl: undefined,

              // Overrides the Signup Confirmation URL
              registrationConfirmationUrl: window.location.href,

            },
            nocode: {
              // Nice to clean up the url so the access token is less visible
              clearQuerystring: true
            }
          };
        </script>
        <script src="https://cdn.outseta.com/outseta.min.js" data-options="o_options"></script>
      `);
  });
});
