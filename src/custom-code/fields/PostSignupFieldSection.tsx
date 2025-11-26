import { withForm } from "../../forms";
import { customCodeFormOptions } from "../custom-code-form";

export const PostSignupFieldSection = withForm({
  ...customCodeFormOptions,
  render: function Render({ form }) {
    return (
      <fieldset>
        <form.AppField
          name="postSignupMode"
          children={(field) => (
            <field.SelectField
              label="Post Signup"
              items={[
                { label: "As Configured in Outseta", value: "default" },
                { label: "Show success message", value: "message" },
                { label: "Redirect to Framer Page", value: "page" },
                { label: "Redirect to Custom URL", value: "custom" },
              ]}
            />
          )}
        />

        <form.Subscribe
          // Listen to changes in postSignupMode and render the appropriate fields
          selector={(state) => state.values.postSignupMode}
          children={(postSignupMode) => {
            return (
              <>
                {/* Message mode */}
                {postSignupMode === "message" ? (
                  <p>
                    Display default message inside the embed after signup. No
                    redirect.
                  </p>
                ) : null}

                {/* Page mode */}
                <form.AppField
                  name="postSignupPagePath"
                  children={(field) => {
                    if (postSignupMode !== "page") return null;
                    return <field.PageSelectField label="&nbsp;" />;
                  }}
                />

                {/* Custom mode */}
                <form.AppField
                  name="postSignupCustomUrl"
                  children={(field) => {
                    if (postSignupMode !== "custom") return null;
                    return (
                      <field.TextField
                        label="&nbsp;"
                        placeholder="https://example.com/signup-success"
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
