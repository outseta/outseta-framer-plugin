import { framer } from "framer-plugin";
import { createOutsetaScript, parseOutsetaScript } from "./script";
import {
  PostLoginConfig,
  authCallbackConfigToExpression,
  authCallbackExpressionToMode,
} from "./script-post-login";
import {
  type PostSignupConfig,
  postSignupConfigToExpression,
  postSignupExpressionToMode,
} from "./script-post-signup";
import {
  type TokenStorageConfig,
  tokenStorageConfigToExpression,
  tokenStorageExpressionToConfig,
  defaultTokenStorageConfig,
} from "./script-token-storage";
import { domainToExpression, expressionToDomain } from "./script-domain";

export type CustomCodeConfig = {
  domain?: string;
  postLoginConfig: PostLoginConfig;
  postSignupConfig: PostSignupConfig;
  tokenStorageConfig: TokenStorageConfig;
};

export const setCustomCode = async ({
  domain,
  postLoginConfig = { postLoginMode: "default" },
  postSignupConfig = { postSignupMode: "default" },
  tokenStorageConfig = defaultTokenStorageConfig,
}: CustomCodeConfig) => {
  if (!domain) {
    return await framer.setCustomCode({ html: null, location: "headEnd" });
  } else {
    const domainExpression = domainToExpression(domain);
    const authCallbackExpression =
      authCallbackConfigToExpression(postLoginConfig);
    const postSignupExpression = postSignupConfigToExpression(postSignupConfig);
    const tokenStorageExpression =
      tokenStorageConfigToExpression(tokenStorageConfig);
    const script = createOutsetaScript({
      domainExpression,
      authCallbackExpression,
      postSignupExpression,
      tokenStorageExpression,
    });
    return await framer.setCustomCode({ html: script, location: "headEnd" });
  }
};

export const subscribeToCustomCode = (
  callback: (props: {
    domain?: string;
    postLoginConfig: PostLoginConfig;
    postSignupConfig: PostSignupConfig;
    tokenStorageConfig: TokenStorageConfig;
    disabled: boolean;
  }) => void,
) => {
  return framer.subscribeToCustomCode(({ headEnd }) => {
    const disabled = headEnd.disabled || false;
    const outsetaScript = parseOutsetaScript(headEnd.html || "");

    const domain = expressionToDomain(outsetaScript.domainExpression);
    // Convert URL expression back to mode + path
    const postLoginConfig = authCallbackExpressionToMode(
      outsetaScript.authCallbackExpression,
    );
    const postSignupConfig = postSignupExpressionToMode(
      outsetaScript.postSignupExpression,
    );
    const tokenStorageConfig = tokenStorageExpressionToConfig(
      outsetaScript.tokenStorageExpression,
    );

    callback({
      domain,
      postLoginConfig,
      postSignupConfig,
      tokenStorageConfig,
      disabled,
    });
  });
};
