import { describe, it, expect } from "vitest";
import {
  generateExpressionsFromRawHtml,
  createOutsetaScript,
  scriptsMatch,
  DEFAULT_SCRIPT_CONFIG,
  generateScriptFromConfig,
} from "./script";

describe("generateExpressionsFromRawHtml", () => {
  describe("complete script", () => {
    it("should parse a complete Outseta script with all properties", () => {
      const script = `
      <script>
        var o_options = {
          domain: 'test.outseta.com',
          load: "auth,profile,nocode,leadCapture,support,emailList",
          monitorDom: true,
          tokenStorage: "local",
          auth: {
            // Override the Post Login URL configured in Outseta
            authenticationCallbackUrl: "https://example.com/callback",
            registrationConfirmationUrl: window.location.href,
            // Override the Post Signup URL configured in Outseta
            postRegistrationUrl: 'https://example.com/welcome'
          },
          nocode: {
            clearQuerystring: true,
            // Rewrite protected links to point to configured Access Denied URL
            rewriteProtectedLinks: true
          }
        };
      </script>
    `;

      const {
        domainExpression,
        authCallbackExpression,
        postSignupExpression,
        tokenStorageExpression,
      } = generateExpressionsFromRawHtml(script);

      expect(domainExpression).toBe("'test.outseta.com'");
      expect(authCallbackExpression).toBe('"https://example.com/callback"');
      expect(postSignupExpression).toBe("'https://example.com/welcome'");
      expect(tokenStorageExpression).toBe('"local"');
    });

    it("should parse a complete earlier plugin version's script", () => {
      const script = `
        <script>
          var o_options = {
            domain: 'test.outseta.com',
            load: 'auth,profile,nocode,leadCapture,support,emailList',
            monitorDom: 'true',
            auth: {
              // Overrides the Post Login URL or uses the current page
              authenticationCallbackUrl: "" ? new URL("", window.location.origin).href : window.location.href,
              // Overrides the Signup Confirmation URL
              registrationConfirmationUrl: window.location.href,
              // Override the Post Signup URL or signup embed's post signup message
              postRegistrationUrl: "/success" ? new URL("/success", window.location.origin).href : undefined,
            },
            nocode: {
              // Nice to clean up the url so the access token is less visible
              clearQuerystring: true,
              // Rewrite protected links to point to configured Access Denied URL
              rewriteProtectedLinks: true
            }
          };
        </script>
        <script src="https://cdn.outseta.com/outseta.min.js" data-options="o_options"></script>
      `;

      const {
        domainExpression,
        authCallbackExpression,
        postSignupExpression,
        tokenStorageExpression,
      } = generateExpressionsFromRawHtml(script);
      expect(domainExpression).toBe("'test.outseta.com'");
      expect(authCallbackExpression).toBe(
        `"" ? new URL("", window.location.origin).href : window.location.href`,
      );
      expect(postSignupExpression).toBe(
        `"/success" ? new URL("/success", window.location.origin).href : undefined`,
      );
      expect(tokenStorageExpression).toBe(undefined);
    });

    it("should handle empty script", () => {
      const {
        domainExpression,
        authCallbackExpression,
        postSignupExpression,
        tokenStorageExpression,
      } = generateExpressionsFromRawHtml("");
      expect(domainExpression).toBe(undefined);
      expect(authCallbackExpression).toBe(undefined);
      expect(postSignupExpression).toBe(undefined);
      expect(tokenStorageExpression).toBe(undefined);
    });

    it("should handle and preserve weird whitespace", () => {
      const script = `
      <script>
        var o_options = {
          domain: '   test.outseta.com',
          load: 'auth,profile,nocode,leadCapture,support,emailList',
          monitorDom: true,
          auth: {
            registrationConfirmationUrl:     window.location.href,
            postRegistrationUrl: null,
            authenticationCallbackUrl: new        URL("/dashboard", window.location.origin).href
          },
          nocode: {
            clearQuerystring: true,
            // Rewrite protected links to point to configured Access Denied URL
            rewriteProtectedLinks: true
          }
        };
      </script>
    `;

      const { domainExpression, authCallbackExpression, postSignupExpression } =
        generateExpressionsFromRawHtml(script);
      expect(domainExpression).toBe("'   test.outseta.com'");
      expect(authCallbackExpression).toBe(
        'new        URL("/dashboard", window.location.origin).href',
      );
      expect(postSignupExpression).toBe("null");
    });
  });

  describe("domain", () => {
    it("should parse regular allowed expressions", () => {
      const script1 = `
        <script>
          var o_options = {
            domain: 'test.outseta.com',
          };
        </script>
      `;

      const { domainExpression: domainExpression1 } =
        generateExpressionsFromRawHtml(script1);
      expect(domainExpression1).toBe("'test.outseta.com'");

      const script2 = `
        <script>
          var o_options = {
            domain: "myapp.outseta.com",
          };
        </script>
      `;

      const { domainExpression: domainExpression2 } =
        generateExpressionsFromRawHtml(script2);
      expect(domainExpression2).toBe('"myapp.outseta.com"');
    });

    it("should handle weird whitespace", () => {
      const script1 = `
        <script>
          var o_options = {
            domain: '   test.outseta.com',
          };
        </script>
      `;

      const { domainExpression: domainExpression1 } =
        generateExpressionsFromRawHtml(script1);
      expect(domainExpression1).toBe("'   test.outseta.com'");

      const script2 = `
        <script>
          var o_options = {
            domain:     'test.outseta.com   '  ,
          };
        </script>
      `;

      const { domainExpression: domainExpression2 } =
        generateExpressionsFromRawHtml(script2);
      expect(domainExpression2).toBe("'test.outseta.com   '");
    });

    it("should return undefined when missing", () => {
      const script = `
        <script>
          var o_options = {
            load: 'auth,profile,nocode,leadCapture,support,emailList',
          };
        </script>
      `;

      const { domainExpression } = generateExpressionsFromRawHtml(script);
      expect(domainExpression).toBe(undefined);
    });

    it("should return empty string for empty string", () => {
      const script1 = `
        <script>
          var o_options = {
            domain: '',
          };
        </script>
      `;

      const { domainExpression: domainExpression1 } =
        generateExpressionsFromRawHtml(script1);
      expect(domainExpression1).toBe("''");

      const script2 = `
        <script>
          var o_options = {
            domain: "",
          };
        </script>
      `;

      const { domainExpression: domainExpression2 } =
        generateExpressionsFromRawHtml(script2);
      expect(domainExpression2).toBe('""');
    });

    it("should return undefined expression for undefined", () => {
      const script = `
        <script>
          var o_options = {
            domain: undefined,
          };
        </script>
      `;

      const { domainExpression } = generateExpressionsFromRawHtml(script);
      expect(domainExpression).toBe("undefined");
    });
  });

  describe("authenticationCallbackUrl", () => {
    it("should parse regular allowed expressions", () => {
      const script1 = `
        <script>
          var o_options = {
            domain: 'myapp.outseta.com',
            load: 'auth,profile',
            auth: {
              authenticationCallbackUrl: "https://example.com/callback",
            },
          };
        </script>
      `;

      const { authCallbackExpression: authCallbackExpression1 } =
        generateExpressionsFromRawHtml(script1);
      expect(authCallbackExpression1).toBe('"https://example.com/callback"');

      const script2 = `
        <script>
          var o_options = {
            domain: 'myapp.outseta.com',
            load: 'auth,profile',
            auth: {
              authenticationCallbackUrl: window.location.href,
            },
          };
        </script>
      `;

      const { authCallbackExpression: authCallbackExpression2 } =
        generateExpressionsFromRawHtml(script2);
      expect(authCallbackExpression2).toBe("window.location.href");

      const script3 = `
        <script>
          var o_options = {
            domain: 'myapp.outseta.com',
            load: 'auth,profile',
            auth: {
              authenticationCallbackUrl: new URL("/dashboard", window.location.origin).href,
            },
          };
        </script>
      `;

      const { authCallbackExpression: authCallbackExpression3 } =
        generateExpressionsFromRawHtml(script3);
      expect(authCallbackExpression3).toBe(
        'new URL("/dashboard", window.location.origin).href',
      );
    });

    it("should handle weird whitespace", () => {
      const script1 = `
        <script>
          var o_options = {
            domain: 'myapp.outseta.com',
            load: 'auth,profile',
            auth: {
              authenticationCallbackUrl: '    ',
            },
          };
        </script>
      `;

      const { authCallbackExpression: authCallbackExpression1 } =
        generateExpressionsFromRawHtml(script1);
      expect(authCallbackExpression1).toBe("'    '");

      const script2 = `
        <script>
          var o_options = {
            domain: 'myapp.outseta.com',
            load: 'auth,profile',
            auth: {
              authenticationCallbackUrl: '    https://example.com/callback',
            },
          };
        </script>
      `;

      const { authCallbackExpression: authCallbackExpression2 } =
        generateExpressionsFromRawHtml(script2);
      expect(authCallbackExpression2).toBe(
        "'    https://example.com/callback'",
      );

      const script3 = `
        <script>
          var o_options = {
            domain: 'myapp.outseta.com',
            load: 'auth,profile',
            auth: {
              authenticationCallbackUrl: new        URL("/dashboard", window.location.origin).href,
            },
          };
        </script>
      `;

      const { authCallbackExpression: authCallbackExpression3 } =
        generateExpressionsFromRawHtml(script3);
      expect(authCallbackExpression3).toBe(
        'new        URL("/dashboard", window.location.origin).href',
      );
    });

    it("should return undefined when missing", () => {
      const script = `
        <script>
          var o_options = {
            domain: 'myapp.outseta.com',
            load: 'auth,profile',
          };
        </script>
      `;

      const { authCallbackExpression } = generateExpressionsFromRawHtml(script);
      expect(authCallbackExpression).toBe(undefined);
    });

    it("should return empty string for empty string", () => {
      const script = `
        <script>
          var o_options = {
            domain: 'myapp.outseta.com',
            load: 'auth,profile',
            auth: {
              authenticationCallbackUrl: '',
            },
          };
        </script>
      `;

      const { authCallbackExpression } = generateExpressionsFromRawHtml(script);
      expect(authCallbackExpression).toBe("''");
    });

    it("should return undefined expression for undefined", () => {
      const script = `
        <script>
          var o_options = {
            domain: 'myapp.outseta.com',
            load: 'auth,profile',
            auth: {
              authenticationCallbackUrl: undefined,
            },
          };
        </script>
      `;

      const { authCallbackExpression } = generateExpressionsFromRawHtml(script);
      expect(authCallbackExpression).toBe("undefined");
    });
  });

  describe("postRegistrationUrl", () => {
    it("should parse regular allowed expressions", () => {
      const script1 = `
        <script>
          var o_options = {
            domain: 'myapp.outseta.com',
            load: 'auth,profile',
            auth: {
              postRegistrationUrl: "https://example.com/welcome",
            },
          };
        </script>
      `;

      const { postSignupExpression: postSignupExpression1 } =
        generateExpressionsFromRawHtml(script1);
      expect(postSignupExpression1).toBe('"https://example.com/welcome"');

      const script2 = `
        <script>
          var o_options = {
            domain: 'myapp.outseta.com',
            load: 'auth,profile',
            auth: {
              postRegistrationUrl: null,
            },
          };
        </script>
      `;

      const { postSignupExpression: postSignupExpression2 } =
        generateExpressionsFromRawHtml(script2);
      expect(postSignupExpression2).toBe("null");

      const script3 = `
        <script>
          var o_options = {
            domain: 'myapp.outseta.com',
            load: 'auth,profile',
            auth: {
              postRegistrationUrl: new URL("/dashboard", window.location.origin).href,
            },
          };
        </script>
      `;

      const { postSignupExpression: postSignupExpression3 } =
        generateExpressionsFromRawHtml(script3);
      expect(postSignupExpression3).toBe(
        'new URL("/dashboard", window.location.origin).href',
      );
    });

    it("should handle weird whitespace", () => {
      const script1 = `
        <script>
          var o_options = {
            domain: 'myapp.outseta.com',
            load: 'auth,profile',
            auth: {
              postRegistrationUrl: '    ',
            },
          };
        </script>
      `;

      const { postSignupExpression: postSignupExpression1 } =
        generateExpressionsFromRawHtml(script1);
      expect(postSignupExpression1).toBe("'    '");

      const script2 = `
        <script>
          var o_options = {
            domain: 'myapp.outseta.com',
            load: 'auth,profile',
            auth: {
              postRegistrationUrl: '    https://example.com/welcome',
            },
          };
        </script>
      `;

      const { postSignupExpression: postSignupExpression2 } =
        generateExpressionsFromRawHtml(script2);
      expect(postSignupExpression2).toBe("'    https://example.com/welcome'");

      const script3 = `
        <script>
          var o_options = {
            domain: 'myapp.outseta.com',
            load: 'auth,profile',
            auth: {
              postRegistrationUrl: new        URL("/dashboard", window.location.origin).href,
            },
          };
        </script>
      `;

      const { postSignupExpression: postSignupExpression3 } =
        generateExpressionsFromRawHtml(script3);
      expect(postSignupExpression3).toBe(
        'new        URL("/dashboard", window.location.origin).href',
      );
    });

    it("should return undefined when missing", () => {
      const script = `
        <script>
          var o_options = {
            domain: 'myapp.outseta.com',
            load: 'auth,profile',
            auth: {},
          };
        </script>
      `;

      const { postSignupExpression } = generateExpressionsFromRawHtml(script);
      expect(postSignupExpression).toBe(undefined);
    });

    it("should return empty string for empty string", () => {
      const script = `
        <script>
          var o_options = {
            domain: 'myapp.outseta.com',
            load: 'auth,profile',
            auth: {
              postRegistrationUrl: '',
            },
          };
        </script>
      `;

      const { postSignupExpression } = generateExpressionsFromRawHtml(script);
      expect(postSignupExpression).toBe("''");
    });

    it("should return undefined expression for undefined", () => {
      const script = `
        <script>
          var o_options = {
            domain: 'myapp.outseta.com',
            load: 'auth,profile',
            auth: {
              postRegistrationUrl: undefined,
            },
          };
        </script>
      `;

      const { postSignupExpression } = generateExpressionsFromRawHtml(script);
      expect(postSignupExpression).toBe("undefined");
    });
  });

  describe("tokenStorage", () => {
    it("should parse tokenStorage with double quotes", () => {
      const script = `
        <script>
          var o_options = {
            domain: 'test.outseta.com',
            tokenStorage: "local",
          };
        </script>
      `;

      const { tokenStorageExpression } = generateExpressionsFromRawHtml(script);
      expect(tokenStorageExpression).toBe('"local"');
    });

    it("should parse tokenStorage with single quotes", () => {
      const script = `
        <script>
          var o_options = {
            domain: 'test.outseta.com',
            tokenStorage: 'session',
          };
        </script>
      `;

      const { tokenStorageExpression } = generateExpressionsFromRawHtml(script);
      expect(tokenStorageExpression).toBe("'session'");
    });

    it("should parse tokenStorage cookie", () => {
      const script = `
        <script>
          var o_options = {
            domain: 'test.outseta.com',
            tokenStorage: "cookie",
          };
        </script>
      `;

      const { tokenStorageExpression } = generateExpressionsFromRawHtml(script);
      expect(tokenStorageExpression).toBe('"cookie"');
    });

    it("should return undefined when missing", () => {
      const script = `
        <script>
          var o_options = {
            domain: 'myapp.outseta.com',
            auth: {},
          };
        </script>
      `;

      const { tokenStorageExpression } = generateExpressionsFromRawHtml(script);
      expect(tokenStorageExpression).toBe(undefined);
    });

    it("should handle whitespace", () => {
      const script = `
        <script>
          var o_options = {
            domain: 'myapp.outseta.com',
            tokenStorage:    "local"   ,
          };
        </script>
      `;

      const { tokenStorageExpression } = generateExpressionsFromRawHtml(script);
      expect(tokenStorageExpression).toBe('"local"');
    });

    it("should return empty string for empty string", () => {
      const script = `
        <script>
          var o_options = {
            domain: 'myapp.outseta.com',
            tokenStorage: '',
          };
        </script>
      `;

      const { tokenStorageExpression } = generateExpressionsFromRawHtml(script);
      expect(tokenStorageExpression).toBe("''");
    });

    it("should return undefined expression for undefined", () => {
      const script = `
        <script>
          var o_options = {
            domain: 'myapp.outseta.com',
            tokenStorage: undefined,
          };
        </script>
      `;

      const { tokenStorageExpression } = generateExpressionsFromRawHtml(script);
      expect(tokenStorageExpression).toBe("undefined");
    });
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
            stopImmediatePropagation: true,
            tokenStorage: undefined,
            auth: {
              // Override the Post Login URL configured in Outseta
              authenticationCallbackUrl: "https://example.com/callback",
              // Override the Post Signup URL configured in Outseta
              postRegistrationUrl: new URL("/welcome", window.location.origin).href,
              // As configured in Outseta
              registrationConfirmationUrl: undefined
            },
            nocode: {
              // Nice to clean up the url so the access token is less visible
              clearQuerystring: true,
              // Rewrite protected links to point to configured Access Denied URL
              rewriteProtectedLinks: true
            }
          };
        </script>
        <script src="https://cdn.outseta.com/outseta.min.js" data-options="o_options"></script>
      `);
  });

  it("should create script with only domain", () => {
    const config = {
      domainExpression: "'myapp.outseta.com'",
      postSignupExpression: undefined,
    };

    const result = createOutsetaScript(config);

    expect(result).toBe(`
        <script>
          var o_options = {
            domain: 'myapp.outseta.com',
            load: 'auth,profile,nocode,leadCapture,support,emailList',
            monitorDom: 'true',
            stopImmediatePropagation: true,
            tokenStorage: undefined,
            auth: {
              // As configured in Outseta
              authenticationCallbackUrl: undefined,
              // As configured in Outseta
              postRegistrationUrl: undefined,
              // As configured in Outseta
              registrationConfirmationUrl: undefined
            },
            nocode: {
              // Nice to clean up the url so the access token is less visible
              clearQuerystring: true,
              // Rewrite protected links to point to configured Access Denied URL
              rewriteProtectedLinks: true
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
            stopImmediatePropagation: true,
            tokenStorage: undefined,
            auth: {
              // Override the Post Login URL configured in Outseta
              authenticationCallbackUrl: "https://myapp.com/auth/callback",
              // As configured in Outseta
              postRegistrationUrl: undefined,
              // As configured in Outseta
              registrationConfirmationUrl: undefined
            },
            nocode: {
              // Nice to clean up the url so the access token is less visible
              clearQuerystring: true,
              // Rewrite protected links to point to configured Access Denied URL
              rewriteProtectedLinks: true
            }
          };
        </script>
        <script src="https://cdn.outseta.com/outseta.min.js" data-options="o_options"></script>
      `);
  });

  it("should create script with domain and postSignupExpression (page)", () => {
    const config = {
      domainExpression: "'app.outseta.com'",
      postSignupExpression:
        'new URL("/dashboard", window.location.origin).href',
    };

    const result = createOutsetaScript(config);

    expect(result).toBe(`
        <script>
          var o_options = {
            domain: 'app.outseta.com',
            load: 'auth,profile,nocode,leadCapture,support,emailList',
            monitorDom: 'true',
            stopImmediatePropagation: true,
            tokenStorage: undefined,
            auth: {
              // As configured in Outseta
              authenticationCallbackUrl: undefined,
              // Override the Post Signup URL configured in Outseta
              postRegistrationUrl: new URL("/dashboard", window.location.origin).href,
              // As configured in Outseta
              registrationConfirmationUrl: undefined
            },
            nocode: {
              // Nice to clean up the url so the access token is less visible
              clearQuerystring: true,
              // Rewrite protected links to point to configured Access Denied URL
              rewriteProtectedLinks: true
            }
          };
        </script>
        <script src="https://cdn.outseta.com/outseta.min.js" data-options="o_options"></script>
      `);
  });

  it("should include postRegistrationUrl as undefined when no expression is provided", () => {
    const config = {
      domainExpression: "'test.outseta.com'",
      authCallbackExpression: undefined,
    };

    const result = createOutsetaScript(config);

    expect(result).toBe(`
        <script>
          var o_options = {
            domain: 'test.outseta.com',
            load: 'auth,profile,nocode,leadCapture,support,emailList',
            monitorDom: 'true',
            stopImmediatePropagation: true,
            tokenStorage: undefined,
            auth: {
              // As configured in Outseta
              authenticationCallbackUrl: undefined,
              // As configured in Outseta
              postRegistrationUrl: undefined,
              // As configured in Outseta
              registrationConfirmationUrl: undefined
            },
            nocode: {
              // Nice to clean up the url so the access token is less visible
              clearQuerystring: true,
              // Rewrite protected links to point to configured Access Denied URL
              rewriteProtectedLinks: true
            }
          };
        </script>
        <script src="https://cdn.outseta.com/outseta.min.js" data-options="o_options"></script>
      `);
  });

  it("should create script with tokenStorage", () => {
    const config = {
      domainExpression: "'test.outseta.com'",
      tokenStorageExpression: '"local"',
    };

    const result = createOutsetaScript(config);

    expect(result).toBe(`
        <script>
          var o_options = {
            domain: 'test.outseta.com',
            load: 'auth,profile,nocode,leadCapture,support,emailList',
            monitorDom: 'true',
            stopImmediatePropagation: true,
            tokenStorage: "local",
            auth: {
              // As configured in Outseta
              authenticationCallbackUrl: undefined,
              // As configured in Outseta
              postRegistrationUrl: undefined,
              // As configured in Outseta
              registrationConfirmationUrl: undefined
            },
            nocode: {
              // Nice to clean up the url so the access token is less visible
              clearQuerystring: true,
              // Rewrite protected links to point to configured Access Denied URL
              rewriteProtectedLinks: true
            }
          };
        </script>
        <script src="https://cdn.outseta.com/outseta.min.js" data-options="o_options"></script>
      `);
  });

  it("should create script with all properties including tokenStorage", () => {
    const config = {
      domainExpression: "'test.outseta.com'",
      authCallbackExpression: '"https://example.com/callback"',
      postSignupExpression: 'new URL("/welcome", window.location.origin).href',
      tokenStorageExpression: '"session"',
    };

    const result = createOutsetaScript(config);

    expect(result).toBe(`
        <script>
          var o_options = {
            domain: 'test.outseta.com',
            load: 'auth,profile,nocode,leadCapture,support,emailList',
            monitorDom: 'true',
            stopImmediatePropagation: true,
            tokenStorage: "session",
            auth: {
              // Override the Post Login URL configured in Outseta
              authenticationCallbackUrl: "https://example.com/callback",
              // Override the Post Signup URL configured in Outseta
              postRegistrationUrl: new URL("/welcome", window.location.origin).href,
              // As configured in Outseta
              registrationConfirmationUrl: undefined
            },
            nocode: {
              // Nice to clean up the url so the access token is less visible
              clearQuerystring: true,
              // Rewrite protected links to point to configured Access Denied URL
              rewriteProtectedLinks: true
            }
          };
        </script>
        <script src="https://cdn.outseta.com/outseta.min.js" data-options="o_options"></script>
      `);
  });
});

describe("signupConfirmationExpression parsing and generation", () => {
  describe("parseOutsetaScript - signupConfirmationExpression", () => {
    it("should parse registrationConfirmationUrl with window.location.href", () => {
      const script = `
        <script>
          var o_options = {
            domain: 'test.outseta.com',
            auth: {
              registrationConfirmationUrl: window.location.href
            },
          };
        </script>
      `;

      const { signupConfirmationExpression } =
        generateExpressionsFromRawHtml(script);
      expect(signupConfirmationExpression).toBe("window.location.href");
    });

    it("should parse registrationConfirmationUrl with custom URL", () => {
      const script = `
        <script>
          var o_options = {
            domain: 'test.outseta.com',
            auth: {
              registrationConfirmationUrl: "https://example.com/confirmed"
            },
          };
        </script>
      `;

      const { signupConfirmationExpression } =
        generateExpressionsFromRawHtml(script);
      expect(signupConfirmationExpression).toBe(
        '"https://example.com/confirmed"',
      );
    });

    it("should parse registrationConfirmationUrl with new URL expression", () => {
      const script = `
        <script>
          var o_options = {
            domain: 'test.outseta.com',
            auth: {
              registrationConfirmationUrl: new URL("/welcome", window.location.origin).href,
            },
          };
        </script>
      `;

      const { signupConfirmationExpression } =
        generateExpressionsFromRawHtml(script);
      expect(signupConfirmationExpression).toBe(
        'new URL("/welcome", window.location.origin).href',
      );
    });

    it("should return undefined when registrationConfirmationUrl is not present", () => {
      const script = `
        <script>
          var o_options = {
            domain: 'test.outseta.com',
            auth: {
              authenticationCallbackUrl: "https://example.com/callback",
            },
          };
        </script>
      `;

      const { signupConfirmationExpression } =
        generateExpressionsFromRawHtml(script);
      expect(signupConfirmationExpression).toBe(undefined);
    });

    it("should handle whitespace in registrationConfirmationUrl", () => {
      const script = `
        <script>
          var o_options = {
            domain: 'test.outseta.com',
            auth: {
              registrationConfirmationUrl:     window.location.href
            },
          };
        </script>
      `;

      const { signupConfirmationExpression } =
        generateExpressionsFromRawHtml(script);
      expect(signupConfirmationExpression).toBe("window.location.href");
    });
  });

  describe("createOutsetaScript - signupConfirmationExpression", () => {
    it("should not include registrationConfirmationUrl when expression is undefined", () => {
      const config = {
        domainExpression: "'test.outseta.com'",
        signupConfirmationExpression: undefined,
      };

      const result = createOutsetaScript(config);

      expect(result).toBe(`
        <script>
          var o_options = {
            domain: 'test.outseta.com',
            load: 'auth,profile,nocode,leadCapture,support,emailList',
            monitorDom: 'true',
            stopImmediatePropagation: true,
            tokenStorage: undefined,
            auth: {
              // As configured in Outseta
              authenticationCallbackUrl: undefined,
              // As configured in Outseta
              postRegistrationUrl: undefined,
              // As configured in Outseta
              registrationConfirmationUrl: undefined
            },
            nocode: {
              // Nice to clean up the url so the access token is less visible
              clearQuerystring: true,
              // Rewrite protected links to point to configured Access Denied URL
              rewriteProtectedLinks: true
            }
          };
        </script>
        <script src="https://cdn.outseta.com/outseta.min.js" data-options="o_options"></script>
      `);
    });

    it("should include registrationConfirmationUrl with window.location.href", () => {
      const config = {
        domainExpression: "'test.outseta.com'",
        signupConfirmationExpression: "window.location.href",
      };

      const result = createOutsetaScript(config);

      expect(result).toBe(`
        <script>
          var o_options = {
            domain: 'test.outseta.com',
            load: 'auth,profile,nocode,leadCapture,support,emailList',
            monitorDom: 'true',
            stopImmediatePropagation: true,
            tokenStorage: undefined,
            auth: {
              // As configured in Outseta
              authenticationCallbackUrl: undefined,
              // As configured in Outseta
              postRegistrationUrl: undefined,
              // Override the Signup Confirmation URL configured in Outseta
              registrationConfirmationUrl: window.location.href
            },
            nocode: {
              // Nice to clean up the url so the access token is less visible
              clearQuerystring: true,
              // Rewrite protected links to point to configured Access Denied URL
              rewriteProtectedLinks: true
            }
          };
        </script>
        <script src="https://cdn.outseta.com/outseta.min.js" data-options="o_options"></script>
      `);
    });

    it("should include registrationConfirmationUrl with custom URL", () => {
      const config = {
        domainExpression: "'test.outseta.com'",
        signupConfirmationExpression: '"https://example.com/confirmed"',
      };

      const result = createOutsetaScript(config);

      expect(result).toBe(`
        <script>
          var o_options = {
            domain: 'test.outseta.com',
            load: 'auth,profile,nocode,leadCapture,support,emailList',
            monitorDom: 'true',
            stopImmediatePropagation: true,
            tokenStorage: undefined,
            auth: {
              // As configured in Outseta
              authenticationCallbackUrl: undefined,
              // As configured in Outseta
              postRegistrationUrl: undefined,
              // Override the Signup Confirmation URL configured in Outseta
              registrationConfirmationUrl: "https://example.com/confirmed"
            },
            nocode: {
              // Nice to clean up the url so the access token is less visible
              clearQuerystring: true,
              // Rewrite protected links to point to configured Access Denied URL
              rewriteProtectedLinks: true
            }
          };
        </script>
        <script src="https://cdn.outseta.com/outseta.min.js" data-options="o_options"></script>
      `);
    });

    it("should include registrationConfirmationUrl with new URL expression", () => {
      const config = {
        domainExpression: "'test.outseta.com'",
        signupConfirmationExpression:
          'new URL("/welcome", window.location.origin).href',
      };

      const result = createOutsetaScript(config);

      expect(result).toBe(`
        <script>
          var o_options = {
            domain: 'test.outseta.com',
            load: 'auth,profile,nocode,leadCapture,support,emailList',
            monitorDom: 'true',
            stopImmediatePropagation: true,
            tokenStorage: undefined,
            auth: {
              // As configured in Outseta
              authenticationCallbackUrl: undefined,
              // As configured in Outseta
              postRegistrationUrl: undefined,
              // Override the Signup Confirmation URL configured in Outseta
              registrationConfirmationUrl: new URL("/welcome", window.location.origin).href
            },
            nocode: {
              // Nice to clean up the url so the access token is less visible
              clearQuerystring: true,
              // Rewrite protected links to point to configured Access Denied URL
              rewriteProtectedLinks: true
            }
          };
        </script>
        <script src="https://cdn.outseta.com/outseta.min.js" data-options="o_options"></script>
      `);
    });

    it("should include all URL configurations together", () => {
      const config = {
        domainExpression: "'test.outseta.com'",
        authCallbackExpression: '"https://example.com/callback"',
        signupConfirmationExpression: "window.location.href",
        postSignupExpression:
          'new URL("/dashboard", window.location.origin).href',
      };

      const result = createOutsetaScript(config);

      expect(result).toBe(`
        <script>
          var o_options = {
            domain: 'test.outseta.com',
            load: 'auth,profile,nocode,leadCapture,support,emailList',
            monitorDom: 'true',
            stopImmediatePropagation: true,
            tokenStorage: undefined,
            auth: {
              // Override the Post Login URL configured in Outseta
              authenticationCallbackUrl: "https://example.com/callback",
              // Override the Post Signup URL configured in Outseta
              postRegistrationUrl: new URL("/dashboard", window.location.origin).href,
              // Override the Signup Confirmation URL configured in Outseta
              registrationConfirmationUrl: window.location.href
            },
            nocode: {
              // Nice to clean up the url so the access token is less visible
              clearQuerystring: true,
              // Rewrite protected links to point to configured Access Denied URL
              rewriteProtectedLinks: true
            }
          };
        </script>
        <script src="https://cdn.outseta.com/outseta.min.js" data-options="o_options"></script>
      `);
    });
  });
});

describe("scriptsMatch", () => {
  it("should return true when both rawHtml and config.domain are empty", () => {
    const result = scriptsMatch("", DEFAULT_SCRIPT_CONFIG);
    expect(result).toBe(true);
  });

  it("should return true when rawHtml is whitespace and config.domain is empty", () => {
    const result = scriptsMatch("   \n\t  ", DEFAULT_SCRIPT_CONFIG);
    expect(result).toBe(true);
  });

  it("should return false when rawHtml is empty but config.domain is set", () => {
    const config = {
      ...DEFAULT_SCRIPT_CONFIG,
      domain: "test.outseta.com",
    };
    const result = scriptsMatch("", config);
    expect(result).toBe(false);
  });

  it("should return false when rawHtml is set but config.domain is empty", () => {
    const script = `
      <script>
        var o_options = {
          domain: 'test.outseta.com',
        };
      </script>
    `;
    const result = scriptsMatch(script, DEFAULT_SCRIPT_CONFIG);
    expect(result).toBe(false);
  });

  it("should return true when scripts match exactly", () => {
    const config = {
      ...DEFAULT_SCRIPT_CONFIG,
      domain: "test.outseta.com",
    };
    const script = generateScriptFromConfig(config);
    const result = scriptsMatch(script, config);
    expect(result).toBe(true);
  });

  it("should return true when scripts match after normalization", () => {
    const config = {
      ...DEFAULT_SCRIPT_CONFIG,
      domain: "test.outseta.com",
    };
    const script = generateScriptFromConfig(config);
    // Add extra whitespace that should be normalized
    const scriptWithWhitespace = `   ${script}   \n\n`;
    const result = scriptsMatch(scriptWithWhitespace, config);
    expect(result).toBe(true);
  });

  it("should return false when scripts do not match", () => {
    const config = {
      ...DEFAULT_SCRIPT_CONFIG,
      domain: "test.outseta.com",
    };
    const differentScript = `
      <script>
        var o_options = {
          domain: 'different.outseta.com',
        };
      </script>
    `;
    const result = scriptsMatch(differentScript, config);
    expect(result).toBe(false);
  });
});
