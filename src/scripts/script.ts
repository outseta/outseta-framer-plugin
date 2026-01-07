import {
  expressionToDomainConfig,
  domainConfigToExpression,
  DEFAULT_DOMAIN_CONFIG,
  type DomainConfig,
  domainSchema,
} from "./script-domain";
import {
  type TokenStorageConfig,
  DEFAULT_TOKEN_STORAGE_CONFIG,
  tokenStorageConfigToExpression,
  tokenStorageExpressionToConfig,
  tokenStorageSchema,
} from "./script-token-storage";
import {
  type PostLoginConfig,
  DEFAULT_POST_LOGIN_CONFIG,
  authCallbackConfigToExpression,
  authCallbackExpressionToConfig,
  postLoginSchema,
} from "./script-post-login";
import {
  type SignupConfirmationConfig,
  DEFAULT_SIGNUP_CONFIRMATION_CONFIG,
  signupConfirmationConfigToExpression,
  signupConfirmationExpressionToConfig,
  signupConfirmationSchema,
} from "./script-signup-confirmation";
import {
  type PostSignupConfig,
  DEFAULT_POST_SIGNUP_CONFIG,
  postSignupConfigToExpression,
  postSignupExpressionToConfig,
  postSignupSchema,
} from "./script-post-signup";

export type OutsetaScriptOptions = {
  domainExpression?: string;
  authCallbackExpression?: string;
  signupConfirmationExpression?: string;
  postSignupExpression?: string;
  tokenStorageExpression?: string;
};

export type ScriptConfig = TokenStorageConfig &
  PostLoginConfig &
  SignupConfirmationConfig &
  PostSignupConfig &
  DomainConfig;

export const DEFAULT_SCRIPT_CONFIG: ScriptConfig = {
  ...DEFAULT_DOMAIN_CONFIG,
  ...DEFAULT_TOKEN_STORAGE_CONFIG,
  ...DEFAULT_POST_LOGIN_CONFIG,
  ...DEFAULT_SIGNUP_CONFIRMATION_CONFIG,
  ...DEFAULT_POST_SIGNUP_CONFIG,
};

export const scriptConfigSchema = domainSchema
  .and(tokenStorageSchema)
  .and(postLoginSchema)
  .and(postSignupSchema)
  .and(signupConfirmationSchema);

// Generate script from config values
export function generateScriptFromConfig(config: ScriptConfig): string {
  if (!config.domain) return "";

  const domainExpression = domainConfigToExpression(config);
  const tokenStorageExpression = tokenStorageConfigToExpression(config);
  const authCallbackExpression = authCallbackConfigToExpression(config);
  const signupConfirmationExpression =
    signupConfirmationConfigToExpression(config);
  const postSignupExpression = postSignupConfigToExpression(config);

  return createOutsetaScript({
    domainExpression,
    tokenStorageExpression,
    authCallbackExpression,
    signupConfirmationExpression,
    postSignupExpression,
  });
}

export function generateConfigFromRawHtml(rawHtml: string): ScriptConfig {
  const outsetaScript = generateExpressionsFromRawHtml(rawHtml);

  const domainConfig = expressionToDomainConfig(outsetaScript.domainExpression);
  const tokenStorageConfig = tokenStorageExpressionToConfig(
    outsetaScript.tokenStorageExpression,
  );
  const postLoginConfig = authCallbackExpressionToConfig(
    outsetaScript.authCallbackExpression,
  );
  const signupConfirmationConfig = signupConfirmationExpressionToConfig(
    outsetaScript.signupConfirmationExpression,
  );
  const postSignupConfig = postSignupExpressionToConfig(
    outsetaScript.postSignupExpression,
  );

  return {
    ...domainConfig,
    ...tokenStorageConfig,
    ...postLoginConfig,
    ...signupConfirmationConfig,
    ...postSignupConfig,
  };
}

export const generateExpressionsFromRawHtml = (
  code: string,
): OutsetaScriptOptions => {
  // Captures the full expression after domain
  const domainRegex = /domain:\s*([\s\S]+?)(?=,\s*(\n|\})|\n|\}|$)/;
  // Capture the full expression after tokenStorage
  const tokenStorageRegex = /tokenStorage:\s*([\s\S]+?)(?=,\s*(\n|\})|\n|\}|$)/;
  // Captures the full expression after authenticationCallbackUrl
  const authCallbackUrlRegex =
    /authenticationCallbackUrl:\s*([\s\S]+?)(?=,\s*(\n|\})|\n|\}|$)/;
  // Capture the full expression after postRegistrationUrl
  const postRegistrationRegex =
    /postRegistrationUrl:\s*([\s\S]+?)(?=,\s*(\n|\})|\n|\}|$)/;
  // Capture the full expression after registrationConfirmationUrl
  const signupConfirmationRegex =
    /registrationConfirmationUrl:\s*([\s\S]+?)(?=,\s*(\n|\})|\n|\}|$)/;

  const domainMatch = code.match(domainRegex);
  const tokenStorageMatch = code.match(tokenStorageRegex);
  const authCallbackUrlMatch = code.match(authCallbackUrlRegex);
  const postSignupExpressionMatch = code.match(postRegistrationRegex);
  const signupConfirmationMatch = code.match(signupConfirmationRegex);

  return {
    domainExpression: domainMatch ? domainMatch[1].trim() : undefined,
    tokenStorageExpression: tokenStorageMatch
      ? tokenStorageMatch[1].trim()
      : undefined,
    authCallbackExpression: authCallbackUrlMatch
      ? authCallbackUrlMatch[1].trim()
      : undefined,
    postSignupExpression: postSignupExpressionMatch
      ? postSignupExpressionMatch[1].trim()
      : undefined,
    signupConfirmationExpression: signupConfirmationMatch
      ? signupConfirmationMatch[1].trim()
      : undefined,
  };
};

export const createOutsetaScript = ({
  domainExpression,
  authCallbackExpression,
  signupConfirmationExpression,
  postSignupExpression,
  tokenStorageExpression,
}: OutsetaScriptOptions): string => {
  const script = `
        <script>
          var o_options = {
            domain: ${domainExpression},
            load: 'auth,profile,nocode,leadCapture,support,emailList',
            monitorDom: 'true',
            tokenStorage: ${tokenStorageExpression !== undefined ? `${tokenStorageExpression},` : `undefined,`}
            auth: {
              ${authCallbackExpression !== undefined ? `// Override the Post Login URL configured in Outseta` : `// As configured in Outseta`}
              authenticationCallbackUrl: ${authCallbackExpression !== undefined ? `${authCallbackExpression},` : `undefined,`}
              ${postSignupExpression !== undefined ? `// Override the Post Signup URL configured in Outseta` : `// As configured in Outseta`}
              postRegistrationUrl: ${postSignupExpression !== undefined ? `${postSignupExpression},` : `undefined,`}
              ${signupConfirmationExpression !== undefined ? `// Override the Signup Confirmation URL configured in Outseta` : `// As configured in Outseta`}
              registrationConfirmationUrl: ${signupConfirmationExpression !== undefined ? `${signupConfirmationExpression}` : `undefined`}
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
  return script;
};

/**
 * Normalizes whitespace in a script string for comparison
 * - Trims leading/trailing whitespace
 * - Normalizes line breaks to \n
 * - Collapses multiple consecutive whitespace characters to single spaces
 */
function normalizeScript(script: string): string {
  return script
    .trim()
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n/g, "\n");
}

/**
 * Compares raw HTML script with what would be generated from the current config.
 * Returns true if they match (after normalization), false otherwise.
 * Returns true if both rawHtml and config.domain are empty (both unconfigured).
 */
export function scriptsMatch(rawHtml: string, config: ScriptConfig): boolean {
  const isEmptyHtml = !rawHtml || !rawHtml.trim();
  const isEmptyDomain = !config.domain || !config.domain.trim();

  // If both are empty, they match (both unconfigured)
  if (isEmptyHtml && isEmptyDomain) {
    return true;
  }

  // If one is empty but the other isn't, they don't match
  if (isEmptyHtml || isEmptyDomain) {
    return false;
  }

  try {
    // Generate script from the provided config (using current generation logic)
    const regeneratedScript = generateScriptFromConfig(config);

    // Normalize both scripts for comparison
    const normalizedRaw = normalizeScript(rawHtml);
    const normalizedRegenerated = normalizeScript(regeneratedScript);

    return normalizedRaw === normalizedRegenerated;
  } catch {
    // If generation or normalization fails, they don't match
    return false;
  }
}
