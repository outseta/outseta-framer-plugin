import { describe, it, expect } from "vitest";
import { parseOutsetaScript, createOutsetaScript } from "./script";

describe("parseOutsetaScript", () => {
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
            clearQuerystring: true
          }
        };
      </script>
    `;

      const {
        domainExpression,
        authCallbackExpression,
        postSignupExpression,
        tokenStorageExpression,
      } = parseOutsetaScript(script);

      expect(domainExpression).toBe("'test.outseta.com'");
      expect(authCallbackExpression).toBe('"https://example.com/callback"');
      expect(postSignupExpression).toBe("'https://example.com/welcome'");
      expect(tokenStorageExpression).toBe('"local"');
    });

    it("should handle empty script", () => {
      const {
        domainExpression,
        authCallbackExpression,
        postSignupExpression,
        tokenStorageExpression,
      } = parseOutsetaScript("");
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
            clearQuerystring: true
          }
        };
      </script>
    `;

      const { domainExpression, authCallbackExpression, postSignupExpression } =
        parseOutsetaScript(script);
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
        parseOutsetaScript(script1);
      expect(domainExpression1).toBe("'test.outseta.com'");

      const script2 = `
        <script>
          var o_options = {
            domain: "myapp.outseta.com",
          };
        </script>
      `;

      const { domainExpression: domainExpression2 } =
        parseOutsetaScript(script2);
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
        parseOutsetaScript(script1);
      expect(domainExpression1).toBe("'   test.outseta.com'");

      const script2 = `
        <script>
          var o_options = {
            domain:     'test.outseta.com   '  ,
          };
        </script>
      `;

      const { domainExpression: domainExpression2 } =
        parseOutsetaScript(script2);
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

      const { domainExpression } = parseOutsetaScript(script);
      expect(domainExpression).toBe(undefined);
    });

    it("should return undefined for empty string", () => {
      const script = `
        <script>
          var o_options = {
            domain: '',
          };
        </script>
      `;

      const { domainExpression } = parseOutsetaScript(script);
      expect(domainExpression).toBe("''");
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
        parseOutsetaScript(script1);
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
        parseOutsetaScript(script2);
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
        parseOutsetaScript(script3);
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
        parseOutsetaScript(script1);
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
        parseOutsetaScript(script2);
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
        parseOutsetaScript(script3);
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

      const { authCallbackExpression } = parseOutsetaScript(script);
      expect(authCallbackExpression).toBe(undefined);
    });

    it("should return undefined for empty string", () => {
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

      const { authCallbackExpression } = parseOutsetaScript(script);
      expect(authCallbackExpression).toBe("''");
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
        parseOutsetaScript(script1);
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
        parseOutsetaScript(script2);
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
        parseOutsetaScript(script3);
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
        parseOutsetaScript(script1);
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
        parseOutsetaScript(script2);
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
        parseOutsetaScript(script3);
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

      const { postSignupExpression } = parseOutsetaScript(script);
      expect(postSignupExpression).toBe(undefined);
    });

    it("should return undefined for empty string", () => {
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

      const { postSignupExpression } = parseOutsetaScript(script);
      expect(postSignupExpression).toBe("''");
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

      const { tokenStorageExpression } = parseOutsetaScript(script);
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

      const { tokenStorageExpression } = parseOutsetaScript(script);
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

      const { tokenStorageExpression } = parseOutsetaScript(script);
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

      const { tokenStorageExpression } = parseOutsetaScript(script);
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

      const { tokenStorageExpression } = parseOutsetaScript(script);
      expect(tokenStorageExpression).toBe('"local"');
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
      postSignupExpression: undefined,
    };

    const result = createOutsetaScript(config);

    expect(result).toBe(`
        <script>
          var o_options = {
            domain: 'myapp.outseta.com',
            load: 'auth,profile,nocode,leadCapture,support,emailList',
            monitorDom: 'true',
            tokenStorage: undefined,
            auth: {
              // As configured in Outseta
              authenticationCallbackUrl: undefined
              // As configured in Outseta
              postRegistrationUrl: undefined
              // As configured in Outseta
              registrationConfirmationUrl: undefined
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
            tokenStorage: undefined,
            auth: {
              // Override the Post Login URL configured in Outseta
              authenticationCallbackUrl: "https://myapp.com/auth/callback",
              // As configured in Outseta
              postRegistrationUrl: undefined
              // As configured in Outseta
              registrationConfirmationUrl: undefined
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
            tokenStorage: undefined,
            auth: {
              // As configured in Outseta
              authenticationCallbackUrl: undefined
              // Override the Post Signup URL configured in Outseta
              postRegistrationUrl: new URL("/dashboard", window.location.origin).href,
              // As configured in Outseta
              registrationConfirmationUrl: undefined
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
            tokenStorage: undefined,
            auth: {
              // As configured in Outseta
              authenticationCallbackUrl: undefined
              // As configured in Outseta
              postRegistrationUrl: undefined
              // As configured in Outseta
              registrationConfirmationUrl: undefined
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
            tokenStorage: "local",
            auth: {
              // As configured in Outseta
              authenticationCallbackUrl: undefined
              // As configured in Outseta
              postRegistrationUrl: undefined
              // As configured in Outseta
              registrationConfirmationUrl: undefined
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
              clearQuerystring: true
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
              registrationConfirmationUrl: window.location.href,
            },
          };
        </script>
      `;

      const { signupConfirmationExpression } = parseOutsetaScript(script);
      expect(signupConfirmationExpression).toBe("window.location.href");
    });

    it("should parse registrationConfirmationUrl with custom URL", () => {
      const script = `
        <script>
          var o_options = {
            domain: 'test.outseta.com',
            auth: {
              registrationConfirmationUrl: "https://example.com/confirmed",
            },
          };
        </script>
      `;

      const { signupConfirmationExpression } = parseOutsetaScript(script);
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

      const { signupConfirmationExpression } = parseOutsetaScript(script);
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

      const { signupConfirmationExpression } = parseOutsetaScript(script);
      expect(signupConfirmationExpression).toBe(undefined);
    });

    it("should handle whitespace in registrationConfirmationUrl", () => {
      const script = `
        <script>
          var o_options = {
            domain: 'test.outseta.com',
            auth: {
              registrationConfirmationUrl:     window.location.href,
            },
          };
        </script>
      `;

      const { signupConfirmationExpression } = parseOutsetaScript(script);
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
            tokenStorage: undefined,
            auth: {
              // As configured in Outseta
              authenticationCallbackUrl: undefined
              // As configured in Outseta
              postRegistrationUrl: undefined
              // As configured in Outseta
              registrationConfirmationUrl: undefined
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
            tokenStorage: undefined,
            auth: {
              // As configured in Outseta
              authenticationCallbackUrl: undefined
              // As configured in Outseta
              postRegistrationUrl: undefined
              // Override the Signup Confirmation URL configured in Outseta
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
            tokenStorage: undefined,
            auth: {
              // As configured in Outseta
              authenticationCallbackUrl: undefined
              // As configured in Outseta
              postRegistrationUrl: undefined
              // Override the Signup Confirmation URL configured in Outseta
              registrationConfirmationUrl: "https://example.com/confirmed",
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
            tokenStorage: undefined,
            auth: {
              // As configured in Outseta
              authenticationCallbackUrl: undefined
              // As configured in Outseta
              postRegistrationUrl: undefined
              // Override the Signup Confirmation URL configured in Outseta
              registrationConfirmationUrl: new URL("/welcome", window.location.origin).href,
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
            tokenStorage: undefined,
            auth: {
              // Override the Post Login URL configured in Outseta
              authenticationCallbackUrl: "https://example.com/callback",
              // Override the Post Signup URL configured in Outseta
              postRegistrationUrl: new URL("/dashboard", window.location.origin).href,
              // Override the Signup Confirmation URL configured in Outseta
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
});
