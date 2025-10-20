import { framer } from "framer-plugin";
import { createOutsetaScript, parseOutsetaScript } from "./script";
import {
  AuthCallbackConfig,
  authCallbackModeToUrlExpression,
  authCallbackUrlExpressionToMode,
} from "./script-auth-callback";

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
    domain = domain?.trim();
    domain = domain.replace(/https?:\/\//, "");

    // Convert mode + path to URL expression
    const authCallbackUrl = authCallbackModeToUrlExpression(authCallbackConfig);

    return await framer.setCustomCode({
      html: createOutsetaScript({
        domain,
        authCallbackUrl,
        postSignupPath,
      }),
      location: "headEnd",
    });
  }
};

export const subscribeToCustomCode = (
  callback: (props: {
    domain: string;
    authCallbackConfig: AuthCallbackConfig;
    postSignupPath: string;
    disabled: boolean;
  }) => void,
) => {
  return framer.subscribeToCustomCode(({ headEnd }) => {
    const { domain, authCallbackUrl, postSignupPath } = parseOutsetaScript(
      headEnd.html || "",
    );
    const disabled = headEnd.disabled || false;

    // Convert URL expression back to mode + path
    const authCallbackConfig = authCallbackUrlExpressionToMode(authCallbackUrl);

    callback({
      domain,
      authCallbackConfig,
      postSignupPath,
      disabled,
    });
  });
};
