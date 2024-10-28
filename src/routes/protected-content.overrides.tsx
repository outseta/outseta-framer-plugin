import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { getCodeOverrideContent } from "../outseta";
import { Alert, CopyButton } from "../common";
import { Separator } from "@triozer/framer-toolbox";

export const Route = createFileRoute("/protected-content/overrides")({
  component: ProtectedContentOverrides,
});

function ProtectedContentOverrides() {
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
          In addition to protecting full pages you may use the Outseta Code
          Overrides to protect individual components.
        </p>
        <Separator />
        <CopyButton
          disabled={!query.isSuccess}
          text={query.data}
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
          When selecting a component you can now choose to protect it with{" "}
          <code>showForAuthenticated</code>, <code>showForSinglePlan</code> and
          more.
        </p>
      </section>
      <section>
        <Alert level="info">
          <small>You only need to do this once for project!</small>
        </Alert>
      </section>
    </>
  );
}
