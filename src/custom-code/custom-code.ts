import { framer } from "framer-plugin";
import { createOutsetaScript, parseOutsetaScript } from "../scripts";
import {
  PostLoginConfig,
  authCallbackConfigToExpression,
  authCallbackExpressionToMode,
} from "../scripts/post-login";
import {
  type PostSignupConfig,
  postSignupConfigToExpression,
  postSignupExpressionToMode,
} from "../scripts/post-signup";
import {
  type SignupConfirmationConfig,
  signupConfirmationConfigToExpression,
  signupConfirmationExpressionToMode,
} from "../scripts/signup-confirmation";
import {
  type TokenStorageConfig,
  tokenStorageConfigToExpression,
  tokenStorageExpressionToConfig,
  defaultTokenStorageConfig,
} from "../scripts/token-storage";
import { domainToExpression, expressionToDomain } from "../scripts/domain";

export type CustomCodeConfig = {
  domain?: string;
  tokenStorageConfig: TokenStorageConfig;
  postLoginConfig: PostLoginConfig;
  signupConfirmationConfig: SignupConfirmationConfig;
  postSignupConfig: PostSignupConfig;
};

export const setCustomCode = async ({
  domain,
  tokenStorageConfig = defaultTokenStorageConfig,
  postLoginConfig = { postLoginMode: "default" },
  signupConfirmationConfig = { signupConfirmationMode: "default" },
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
    const signupConfirmationExpression = signupConfirmationConfigToExpression(
      signupConfirmationConfig,
    );
    const postSignupExpression = postSignupConfigToExpression(postSignupConfig);

    const script = createOutsetaScript({
      domainExpression,
      tokenStorageExpression,
      authCallbackExpression,
      signupConfirmationExpression,
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
    signupConfirmationConfig: SignupConfirmationConfig;
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
    const signupConfirmationConfig = signupConfirmationExpressionToMode(
      outsetaScript.signupConfirmationExpression,
    );
    const postSignupConfig = postSignupExpressionToMode(
      outsetaScript.postSignupExpression,
    );

    callback({
      domain,
      tokenStorageConfig,
      postLoginConfig,
      signupConfirmationConfig,
      postSignupConfig,
      disabled,
    });
  });
};
