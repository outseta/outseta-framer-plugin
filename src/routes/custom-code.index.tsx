import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";

import { useAppForm } from "../forms";

import {
  setCustomCode,
  useCustomCode,
  DomainFieldSection,
  TokenStorageFieldSection,
  PostLoginFieldSection,
  SignupConfirmationFieldSection,
  PostSignupFieldSection,
  customCodeFormOptions,
  type TokenStorageConfig,
  type PostLoginConfig,
  type SignupConfirmationConfig,
  type PostSignupConfig,
  type CustomCodeSchema,
} from "../custom-code";

// Type-safe helper to construct TokenStorageConfig from form values
function buildTokenStorageConfig(value: CustomCodeSchema): TokenStorageConfig {
  return { tokenStorage: value.tokenStorage };
}

// Type-safe helper to construct PostLoginConfig from form values
function buildPostLoginConfig(value: CustomCodeSchema): PostLoginConfig {
  switch (value.postLoginMode) {
    case "default":
      return { postLoginMode: "default" };
    case "current":
      return { postLoginMode: "current" };
    case "page":
      return {
        postLoginMode: "page",
        postLoginPagePath: value.postLoginPagePath,
      };
    case "custom":
      return {
        postLoginMode: "custom",
        postLoginCustomUrl: value.postLoginCustomUrl,
      };
  }
}

// Type-safe helper to construct PostSignupConfig from form values
function buildPostSignupConfig(value: CustomCodeSchema): PostSignupConfig {
  switch (value.postSignupMode) {
    case "default":
      return { postSignupMode: "default" };
    case "message":
      return { postSignupMode: "message" };
    case "page":
      return {
        postSignupMode: "page",
        postSignupPagePath: value.postSignupPagePath,
      };
    case "custom":
      return {
        postSignupMode: "custom",
        postSignupCustomUrl: value.postSignupCustomUrl,
      };
  }
}

// Type-safe helper to construct SignupConfirmationConfig from form values
function buildSignupConfirmationConfig(
  value: CustomCodeSchema,
): SignupConfirmationConfig {
  switch (value.signupConfirmationMode) {
    case "default":
      return { signupConfirmationMode: "default" };
    case "current":
      return { signupConfirmationMode: "current" };
    case "page":
      return {
        signupConfirmationMode: "page",
        signupConfirmationPagePath: value.signupConfirmationPagePath,
      };
    case "custom":
      return {
        signupConfirmationMode: "custom",
        signupConfirmationCustomUrl: value.signupConfirmationCustomUrl,
      };
  }
}

export const Route = createFileRoute("/custom-code/")({
  component: CustomCode,
});

function CustomCode() {
  const navigate = useNavigate();
  const customCode = useCustomCode();

  const mutation = useMutation({
    mutationFn: setCustomCode,
    onSuccess: () => navigate({ to: "/", from: Route.fullPath }),
  });

  const form = useAppForm({
    ...customCodeFormOptions,
    defaultValues: {
      domain: customCode.domain,
      ...customCode.tokenStorageConfig,
      ...customCode.postLoginConfig,
      ...customCode.signupConfirmationConfig,
      ...customCode.postSignupConfig,
    },

    onSubmit: ({ value }) => {
      const tokenStorageConfig = buildTokenStorageConfig(value);
      const postLoginConfig = buildPostLoginConfig(value);
      const signupConfirmationConfig = buildSignupConfirmationConfig(value);
      const postSignupConfig = buildPostSignupConfig(value);

      mutation.mutate({
        domain: value.domain,
        tokenStorageConfig,
        postLoginConfig,
        signupConfirmationConfig,
        postSignupConfig,
      });
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <DomainFieldSection form={form} />

      <TokenStorageFieldSection form={form} />

      <PostLoginFieldSection form={form} />

      <PostSignupFieldSection form={form} />

      <SignupConfirmationFieldSection form={form} />

      <form.AppForm>
        <form.SubmitButton
          label={
            customCode.domain ? "Update Outseta Script" : "Add Outseta Script"
          }
        />
      </form.AppForm>
    </form>
  );
}
