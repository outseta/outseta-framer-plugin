import { framer } from "framer-plugin";
import { createOutsetaScript, parseOutsetaScript } from "./script";
import {
  AuthCallbackConfig,
  authCallbackConfigToExpression,
  authCallbackExpressionToMode,
} from "./script-auth-callback";
import {
  type PostSignupConfig,
  postSignupConfigToExpression,
  postSignupExpressionToMode,
} from "./script-post-signup";
import { domainToExpression, expressionToDomain } from "./script-domain";

export const setCustomCode = async ({
  domain,
  authCallbackConfig = { mode: "default" },
  postSignupConfig = { mode: "default" },
}: {
  domain: string | null;
  authCallbackConfig?: AuthCallbackConfig;
  postSignupConfig?: PostSignupConfig;
}) => {
  if (!domain) {
    return await framer.setCustomCode({ html: null, location: "headEnd" });
  } else {
    const domainExpression = domainToExpression(domain);
    const authCallbackExpression =
      authCallbackConfigToExpression(authCallbackConfig);
    const postSignupExpression = postSignupConfigToExpression(postSignupConfig);
    const script = createOutsetaScript({
      domainExpression,
      authCallbackExpression,
      postSignupExpression,
    });
    return await framer.setCustomCode({ html: script, location: "headEnd" });
  }
};

export const subscribeToCustomCode = (
  callback: (props: {
    domain?: string;
    authCallbackConfig: AuthCallbackConfig;
    postSignupConfig: PostSignupConfig;
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
    const postSignupConfig = postSignupExpressionToMode(
      outsetaScript.postSignupExpression,
    );

    callback({
      domain,
      authCallbackConfig,
      postSignupConfig,
      disabled,
    });
  });
};
