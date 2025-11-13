import { withForm } from "../forms";
import { customCodeFormOptions } from "./custom-code-form";
import { ExternalLink } from "../common";

export const TokenStorageFieldSection = withForm({
  ...customCodeFormOptions,
  render: function Render({ form }) {
    return (
      <fieldset>
        <form.AppField
          name="tokenStorage"
          children={(field) => (
            <>
              <field.SelectField
                label="Token Storage"
                items={[
                  { label: "Local Storage (default)", value: "local" },
                  { label: "Session Storage", value: "session" },
                  { label: "Cookie", value: "cookie" },
                ]}
              />
              <p>
                Where to store the user's authentication token:
                <br />
                <br />
                <strong>Local Storage:</strong> Token persists across tabs and
                visits.
                <br />
                <strong>Session Storage:</strong> Token only valid in current
                tab, cleared when tab closes.
                <br />
                <strong>Cookie:</strong> Token persists across tabs and visits,
                available across all subdomains.
                <br />
                <br />
                Learn more about{" "}
                <ExternalLink href="https://docs.outseta.com/support/kb/articles/token-storage">
                  token storage options
                </ExternalLink>
                .
              </p>
            </>
          )}
        />
      </fieldset>
    );
  },
});
