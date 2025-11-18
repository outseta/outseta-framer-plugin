import { createFileRoute } from "@tanstack/react-router";
import { revalidateLogic, useForm } from "@tanstack/react-form";

import { CopyButton, PageListControls } from "../common";

export const Route = createFileRoute("/auth/logout")({
  component: AuthLogoutPage,
});

export function AuthLogoutPage() {
  const form = useForm({
    defaultValues: {
      postLogoutPath: "/",
    },
    validationLogic: revalidateLogic({ mode: "submit", modeAfterSubmission: "change" }),
  });

  const postLogoutPath = form.useStore((s) => s.values.postLogoutPath) as string;

  return (
    <form>
      <form.Field name="postLogoutPath">
        {(field) => (
          <PageListControls
            title="Post Logout Path"
            value={field.state.value as string}
            onChange={(value) => field.handleChange(value)}
            onBlur={field.handleBlur}
          />
        )}
      </form.Field>

      <CopyButton
        label="Copy popup url to clipboard"
        text={postLogoutPath + "#o-logout-link"}
      />

      <p>
        Paste the copied url as the <strong>Link To</strong> value
        <br /> and set <strong>New Tab</strong> to <em>No</em>.
      </p>
    </form>
  );
}
