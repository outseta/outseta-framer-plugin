import { describe, it, expect, beforeEach, vi } from "vitest";
import { setCustomCode, subscribeToCustomCode } from "./custom-code";
import {
  createOutsetaScript,
  DEFAULT_SCRIPT_CONFIG,
  ScriptConfig,
} from "../scripts";

// Mock framer-plugin
const mockSetCustomCode = vi.fn();
const mockSubscribeToCustomCode = vi.fn();

vi.mock("framer-plugin", () => ({
  framer: {
    setCustomCode: (...args: unknown[]) => mockSetCustomCode(...args),
    subscribeToCustomCode: (...args: unknown[]) =>
      mockSubscribeToCustomCode(...args),
  },
}));

describe("setCustomCode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call framer.setCustomCode with null when domain is not provided", async () => {
    await setCustomCode(DEFAULT_SCRIPT_CONFIG);

    expect(mockSetCustomCode).toHaveBeenCalledTimes(1);
    expect(mockSetCustomCode).toHaveBeenCalledWith({
      html: null,
      location: "headEnd",
    });
  });

  it("should generate script with domain and default configs", async () => {
    const domain = "test.outseta.com";
    await setCustomCode({ ...DEFAULT_SCRIPT_CONFIG, domain });

    expect(mockSetCustomCode).toHaveBeenCalledTimes(1);
    const callArgs = mockSetCustomCode.mock.calls[0][0];
    expect(callArgs.location).toBe("headEnd");
    expect(callArgs.html).toBeTruthy();

    // Verify the script contains the domain
    expect(callArgs.html).toContain("test.outseta.com");
  });

  it("should generate complete script with all configs", async () => {
    await setCustomCode({
      domain: "myapp.outseta.com",
      tokenStorageMode: "session",
      postLoginMode: "page",
      postLoginPagePath: "/dashboard",
      signupConfirmationMode: "current",
      postSignupMode: "custom",
      postSignupCustomUrl: "https://example.com/welcome",
    });

    expect(mockSetCustomCode).toHaveBeenCalledTimes(1);
    const callArgs = mockSetCustomCode.mock.calls[0][0];
    expect(callArgs.location).toBe("headEnd");
    expect(callArgs.html).toBeTruthy();

    // Verify script content matches expected format
    const expectedScript = createOutsetaScript({
      domainExpression: '"myapp.outseta.com"',
      tokenStorageExpression: '"session"',
      authCallbackExpression:
        'new URL("/dashboard", window.location.origin).href',
      signupConfirmationExpression: "window.location.href",
      postSignupExpression: '"https://example.com/welcome"',
    });

    expect(callArgs.html).toBe(expectedScript);
  });

  it("should verify script content format", async () => {
    const domain = "app.outseta.com";
    await setCustomCode({
      domain,
      tokenStorageMode: "local",
      postLoginMode: "current",
      signupConfirmationMode: "page",
      signupConfirmationPagePath: "/confirm",
      postSignupMode: "message",
    });

    const callArgs = mockSetCustomCode.mock.calls[0][0];
    const script = callArgs.html;

    // Verify script structure
    expect(script).toContain("<script>");
    expect(script).toContain("var o_options =");
    expect(script).toContain('domain: "app.outseta.com"');
    expect(script).toContain('tokenStorage: "local"');
    expect(script).toContain("authenticationCallbackUrl: window.location.href");
    expect(script).toContain(
      'registrationConfirmationUrl: new URL("/confirm", window.location.origin).href',
    );
    expect(script).toContain("postRegistrationUrl: null");
    expect(script).toContain('src="https://cdn.outseta.com/outseta.min.js"');
  });
});

describe("subscribeToCustomCode", () => {
  let mockCallback: ReturnType<typeof mockSubscribeToCustomCode>;

  beforeEach(() => {
    vi.clearAllMocks();
    // Setup mock to capture the callback passed to subscribeToCustomCode
    mockSubscribeToCustomCode.mockImplementation((callback) => {
      mockCallback = callback;
      return () => {}; // Return unsubscribe function
    });
  });

  it("should parse complete script with all configs", () => {
    const callback = vi.fn();
    subscribeToCustomCode(callback);

    const completeScript = `
      <script>
        var o_options = {
          domain: 'test.outseta.com',
          load: 'auth,profile,nocode,leadCapture,support,emailList',
          monitorDom: true,
          tokenStorage: "local",
          auth: {
            authenticationCallbackUrl: "https://example.com/callback",
            registrationConfirmationUrl: window.location.href,
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

    mockCallback({ headEnd: { html: completeScript, disabled: false } });

    expect(callback).toHaveBeenCalledTimes(1);
    const callbackArgs = callback.mock.calls[0][0];
    expect(callbackArgs.config.domain).toBe("test.outseta.com");
    expect(callbackArgs.config.tokenStorageMode).toEqual("local");
    expect(callbackArgs.config.postLoginMode).toEqual("custom");
    expect(callbackArgs.config.postLoginCustomUrl).toEqual(
      "https://example.com/callback",
    );
    expect(callbackArgs.config.postSignupMode).toEqual("custom");
    expect(callbackArgs.config.postSignupCustomUrl).toEqual(
      "https://example.com/welcome",
    );
    expect(callbackArgs.disabled).toBe(false);
  });

  it("should parse old-style ternary script from earlier plugin version", () => {
    const callback = vi.fn();
    subscribeToCustomCode(callback);

    const oldStyleScript = `
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

    mockCallback({ headEnd: { html: oldStyleScript, disabled: false } });

    expect(callback).toHaveBeenCalledTimes(1);
    const callbackArgs = callback.mock.calls[0][0];
    expect(callbackArgs.config.domain).toBe("test.outseta.com");
    // Old-style ternary for empty string should parse as current mode
    expect(callbackArgs.config.postLoginMode).toEqual("current");
    expect(callbackArgs.config.signupConfirmationMode).toEqual("current");
    // Old-style ternary with path should parse as page mode
    expect(callbackArgs.config.postSignupMode).toEqual("page");
    expect(callbackArgs.config.postSignupPagePath).toEqual("/success");
  });

  it("should handle empty", () => {
    const callback = vi.fn();
    subscribeToCustomCode(callback);

    // Test with null HTML
    mockCallback({ headEnd: { html: null, disabled: false } });

    expect(callback).toHaveBeenCalledTimes(1);
    const callbackArgs1 = callback.mock.calls[0][0];
    expect(callbackArgs1.config).toEqual(DEFAULT_SCRIPT_CONFIG);
    expect(callbackArgs1.disabled).toBe(false);
  });

  it("should handle disabled state", () => {
    const callback = vi.fn();
    subscribeToCustomCode(callback);

    mockCallback({ headEnd: { html: null, disabled: true } });

    expect(callback).toHaveBeenCalledTimes(1);
    const callbackArgs = callback.mock.calls[0][0];
    expect(callbackArgs.disabled).toBe(true);
  });

  it("should handle missing domain", () => {
    const callback = vi.fn();
    subscribeToCustomCode(callback);

    const scriptWithoutDomain = `
      <script>
        var o_options = {
          load: 'auth,profile,nocode,leadCapture,support,emailList',
          monitorDom: true,
        };
      </script>
    `;

    mockCallback({ headEnd: { html: scriptWithoutDomain, disabled: false } });

    expect(callback).toHaveBeenCalledTimes(1);
    const callbackArgs = callback.mock.calls[0][0];
    expect(callbackArgs.config).toEqual(DEFAULT_SCRIPT_CONFIG);
  });

  it("should handle roundtrip: set then subscribe", async () => {
    const config: ScriptConfig = {
      domain: "roundtrip.outseta.com",
      tokenStorageMode: "cookie",
      postLoginMode: "page",
      postLoginPagePath: "/home",
      signupConfirmationMode: "page",
      signupConfirmationPagePath: "/verify",
      postSignupMode: "page",
      postSignupPagePath: "/thanks",
    };

    // Set the custom code
    await setCustomCode(config);

    // Get the script that was set
    const setScript = mockSetCustomCode.mock.calls[0][0].html;

    // Now test that subscribeToCustomCode can parse it back
    const callback = vi.fn();
    subscribeToCustomCode(callback);

    mockCallback({ headEnd: { html: setScript, disabled: false } });

    expect(callback).toHaveBeenCalledTimes(1);
    const callbackArgs = callback.mock.calls[0][0];
    expect(callbackArgs.config).toEqual(config);
  });
});
