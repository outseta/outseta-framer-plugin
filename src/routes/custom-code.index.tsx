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
} from "../custom-code";

export const Route = createFileRoute("/custom-code/")({
  component: CustomCodeIndex,
});

function CustomCodeIndex() {
  const navigate = useNavigate();
  const { config, needsUpdate } = useCustomCode();

  const mutation = useMutation({
    mutationFn: setCustomCode,
    onSuccess: () => navigate({ to: "/", from: Route.fullPath }),
  });

  const form = useAppForm({
    ...customCodeFormOptions,
    defaultValues: config,

    onSubmit: ({ value }) => {
      mutation.mutate(value);
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
          label={config.domain ? "Update Outseta Script" : "Add Outseta Script"}
          forceEnabled={needsUpdate}
        />
      </form.AppForm>
    </form>
  );
}
