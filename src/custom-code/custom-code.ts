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
  tokenStorageConfig: TokenStorageConfig;
  postLoginConfig: PostLoginConfig;
  postSignupConfig: PostSignupConfig;
};

export const setCustomCode = async ({
  domain,
  tokenStorageConfig = defaultTokenStorageConfig,
  postLoginConfig = { postLoginMode: "default" },
  postSignupConfig = { postSignupMode: "default" },
}: CustomCodeConfig) => {
  if (!domain) {
    return await framer.setCustomCode({ html: null, location: "headEnd" });
  } else {
    const domainExpression = domainToExpression(domain);
    const tokenStorageExpression =
      tokenStorageConfigToExpression(tokenStorageConfig);
    const authCallbackExpression =
      authCallbackConfigToExpression(postLoginConfig);
    const postSignupExpression = postSignupConfigToExpression(postSignupConfig);

    const script = createOutsetaScript({
      domainExpression,
      tokenStorageExpression,
      authCallbackExpression,
      postSignupExpression,
    });
    return await framer.setCustomCode({ html: script, location: "headEnd" });
  }
};

export const subscribeToCustomCode = (
  callback: (props: {
    domain?: string;
    tokenStorageConfig: TokenStorageConfig;
    postLoginConfig: PostLoginConfig;
    postSignupConfig: PostSignupConfig;

    disabled: boolean;
  }) => void,
) => {
  return framer.subscribeToCustomCode(({ headEnd }) => {
    const disabled = headEnd.disabled || false;
    const outsetaScript = parseOutsetaScript(headEnd.html || "");

    const domain = expressionToDomain(outsetaScript.domainExpression);
    const tokenStorageConfig = tokenStorageExpressionToConfig(
      outsetaScript.tokenStorageExpression,
    );
    // Convert URL expression back to mode + path
    const postLoginConfig = authCallbackExpressionToMode(
      outsetaScript.authCallbackExpression,
    );
    const postSignupConfig = postSignupExpressionToMode(
      outsetaScript.postSignupExpression,
    );

    callback({
      domain,
      tokenStorageConfig,
      postLoginConfig,
      postSignupConfig,
      disabled,
    });
  });
};
