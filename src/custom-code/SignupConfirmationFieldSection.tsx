import { withForm } from "../forms";
import { customCodeFormOptions } from "./custom-code-form";
import { ExternalLink } from "../common";

export const SignupConfirmationFieldSection = withForm({
  ...customCodeFormOptions,
  render: function Render({ form }) {
    return (
      <fieldset>
        <form.AppField
          name="signupConfirmationMode"
          children={(field) => (
            <field.SelectField
              label="Signup Confirmation"
              items={[
                { label: "As Configured in Outseta", value: "default" },
                { label: "Stay on the same page", value: "current" },
                { label: "Redirect to Framer Page", value: "page" },
                { label: "Redirect to Custom URL", value: "custom" },
              ]}
            />
          )}
        />

        <form.Subscribe
          // Listen to changes in signupConfirmationMode and render the appropriate content
          selector={(state) => state.values.signupConfirmationMode}
          children={(signupConfirmationMode) => {
            return (
              <>
                {/* Default mode */}
                {signupConfirmationMode === "default" ? (
                  <p>
                    Redirect users to the URL configured in your{" "}
                    {form.state.values.domain ? (
                      <>
                        <ExternalLink
                          href={`https://${form.state.values.domain}/#/app/auth/sign-up-login`}
                        >
                          Outseta dashboard
                        </ExternalLink>
                      </>
                    ) : (
                      "Outseta dashboard"
                    )}
                    .
                  </p>
                ) : null}

                {/* Current mode */}
                {signupConfirmationMode === "current" ? (
                  <p>
                    Only use with <strong>popup</strong> signup embeds.
                  </p>
                ) : null}

                {/* Page mode */}
                <form.AppField
                  name="signupConfirmationPagePath"
                  children={(field) => {
                    if (signupConfirmationMode !== "page") return null;
                    return <field.PageSelectField label="&nbsp;" />;
                  }}
                />

                {/* Custom mode */}
                <form.AppField
                  name="signupConfirmationCustomUrl"
                  children={(field) => {
                    if (signupConfirmationMode !== "custom") return null;
                    return (
                      <field.TextField
                        label="&nbsp;"
                        placeholder="https://example.com/signup-confirmed"
                      />
                    );
                  }}
                />
              </>
            );
          }}
        />
      </fieldset>
    );
  },
});
