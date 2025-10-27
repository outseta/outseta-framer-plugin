import { framer } from "framer-plugin";
import { createOutsetaScript, parseOutsetaScript } from "./script";
import {
  AuthCallbackConfig,
  authCallbackConfigToExpression,
  authCallbackExpressionToMode,
} from "./script-auth-callback";
import { domainToExpression, expressionToDomain } from "./script-domain";

// Helper to strip quotes from values
const stripQuotes = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  // If the value is quoted (single or double), remove the quotes
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
};

export const setCustomCode = async ({
  domain,
  authCallbackConfig = { mode: "default" },
  postSignupPath,
}: {
  domain: string | null;
  authCallbackConfig?: AuthCallbackConfig;
  postSignupPath?: string;
}) => {
  if (!domain) {
    return await framer.setCustomCode({ html: null, location: "headEnd" });
  } else {
    const domainExpression = domainToExpression(domain);
    const authCallbackExpression =
      authCallbackConfigToExpression(authCallbackConfig);
    const script = createOutsetaScript({
      domainExpression,
      authCallbackExpression,
      postSignupPath,
    });
    return await framer.setCustomCode({ html: script, location: "headEnd" });
  }
};

export const subscribeToCustomCode = (
  callback: (props: {
    domain?: string;
    authCallbackConfig: AuthCallbackConfig;
    postSignupPath?: string;
    disabled: boolean;
  }) => void,
) => {
  return framer.subscribeToCustomCode(({ headEnd }) => {
    const disabled = headEnd.disabled || false;
    const outsetaScript = parseOutsetaScript(headEnd.html || "");

    const domain = expressionToDomain(outsetaScript.domainExpression);
    // Convert URL expression back to mode + path
    const authCallbackConfig = authCallbackExpressionToMode(
      outsetaScript.authCallbackExpression,
    );

    callback({
      domain,
      authCallbackConfig,
      postSignupPath: outsetaScript.postSignupPath,
      disabled,
    });
  });
};
