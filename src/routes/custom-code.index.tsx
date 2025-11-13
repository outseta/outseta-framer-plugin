import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";

import { useAppForm } from "../forms";

import {
  setCustomCode,
  useCustomCode,
  DomainFieldSection,
  TokenStorageFieldSection,
  PostLoginFieldSection,
  PostSignupFieldSection,
  customCodeFormOptions,
} from "../custom-code";
import { type TokenStorageConfig } from "../custom-code/script-token-storage";
import { type PostLoginConfig } from "../custom-code/script-post-login";
import { type PostSignupConfig } from "../custom-code/script-post-signup";
import { type CustomCodeSchema } from "../custom-code/custom-code-form";

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
      ...customCode.postLoginConfig,
      ...customCode.postSignupConfig,
      ...customCode.tokenStorageConfig,
    },

    onSubmit: ({ value }) => {
      const postLoginConfig = buildPostLoginConfig(value);
      const postSignupConfig = buildPostSignupConfig(value);
      const tokenStorageConfig = buildTokenStorageConfig(value);

      mutation.mutate({
        domain: value.domain,
        postLoginConfig,
        postSignupConfig,
        tokenStorageConfig,
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
