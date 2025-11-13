import { withForm } from "../forms";
import { customCodeFormOptions } from "./custom-code-form";

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
                { label: "The page the user was on", value: "current" },
                { label: "A Framer page", value: "page" },
                { label: "A custom URL", value: "custom" },
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
