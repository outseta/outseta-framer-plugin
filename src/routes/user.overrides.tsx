import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { getCodeOverrideContent } from "../outseta";
import { Alert, CopyButton } from "../common";
import { Separator } from "@triozer/framer-toolbox";

export const Route = createFileRoute("/user/overrides")({
  component: UserContentOverrides,
});

function UserContentOverrides() {
  const query = useQuery({
    queryKey: ["outseta", "code-overrides"],
    queryFn: () => {
      return getCodeOverrideContent();
    },
  });

  return (
    <>
      <section>
        <p>
          In addition to the full profile embed you may pull in user data with
          the Outseta Code Overrides.
        </p>
        <Separator />
        <CopyButton
          disabled={!query.isSuccess}
          text={query.data ?? ""}
          label="Copy the Outseta Code Overrides"
        />
        <Separator />
        <p>Paste the copied code into a new Framer Code Asset File.</p>
        <p>
          <small>
            To create this file go to the <code>Asset</code> tab next to{" "}
            <code>Pages</code> and <code>Layers</code> top right in Framer.
            Locate the <code>Code</code> section and click <code>+</code>. Give
            the file the title <code>Outseta</code> and select{" "}
            <code>New Override</code>. Make sure to replace the example code
            with the copied code from above.
          </small>
        </p>
        <p>
          When selecting a component you can now choose to pull in user data
          with <code>withAvatar</code>, <code>withFirstName</code> and more.
        </p>
      </section>
      <section>
        <Alert level="info">
          <small>You only need to do this once for all overrides!</small>
        </Alert>
      </section>
    </>
  );
}
