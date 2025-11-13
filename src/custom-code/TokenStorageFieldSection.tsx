import { withForm } from "../forms";
import { customCodeFormOptions } from "./custom-code-form";

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
                  { label: "Local Storage", value: "local" },
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
                  <p>Users are logged in across tabs and visits.</p>
                ) : null}

                {/* Session Storage mode */}
                {tokenStorage === "session" ? (
                  <p>
                    Users are logged in only in the current tab, and are logged
                    out when the tab is closed.
                  </p>
                ) : null}

                {/* Cookie mode */}
                {tokenStorage === "cookie" ? (
                  <p>
                    Users are logged in across tabs and visits, even across
                    different subdomains.
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
