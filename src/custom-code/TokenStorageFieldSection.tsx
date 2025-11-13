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
            </>
          )}
        />

        <form.Subscribe
          // Listen to changes in tokenStorage and render the appropriate description
          selector={(state) => state.values.tokenStorage}
          children={(tokenStorage) => {
            return (
              <>
                {/* Local Storage mode */}
                {tokenStorage === "local" ? (
                  <p>
                    Token persists across tabs and visits.
                    <br />
                    <br />
                    Learn more about{" "}
                    <ExternalLink href="https://docs.outseta.com/support/kb/articles/token-storage">
                      token storage options
                    </ExternalLink>
                    .
                  </p>
                ) : null}

                {/* Session Storage mode */}
                {tokenStorage === "session" ? (
                  <p>
                    Token only valid in current tab, cleared when tab closes.
                    <br />
                    <br />
                    Learn more about{" "}
                    <ExternalLink href="https://docs.outseta.com/support/kb/articles/token-storage">
                      token storage options
                    </ExternalLink>
                    .
                  </p>
                ) : null}

                {/* Cookie mode */}
                {tokenStorage === "cookie" ? (
                  <p>
                    Token persists across tabs and visits, available across all
                    subdomains.
                    <br />
                    <br />
                    Learn more about{" "}
                    <ExternalLink href="https://docs.outseta.com/support/kb/articles/token-storage">
                      token storage options
                    </ExternalLink>
                    .
                  </p>
                ) : null}
              </>
            );
          }}
        />
      </fieldset>
    );
  },
});
