import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";

import { useAppForm } from "../forms";

import {
  setCustomCode,
  useCustomCode,
  DomainFieldSection,
  PostLoginFieldSection,
  PostSignupFieldSection,
  customCodeFormOptions,
} from "../custom-code";

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
    },
    onSubmit: ({ value }) => {
      mutation.mutate({
        domain: value.domain,
        postLoginConfig: {
          postLoginMode: value.postLoginMode,
          ...(value.postLoginMode === "page"
            ? { postLoginPagePath: value.postLoginPagePath }
            : {}),
          ...(value.postLoginMode === "custom"
            ? { postLoginCustomUrl: value.postLoginCustomUrl }
            : {}),
        },
        postSignupConfig: value.postSignupConfig,
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
