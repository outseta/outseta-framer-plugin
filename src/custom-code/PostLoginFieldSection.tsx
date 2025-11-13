import { withForm } from "../forms";
import { customCodeFormOptions } from "./custom-code-form";
import { ExternalLink } from "../common";

export const PostLoginFieldSection = withForm({
  ...customCodeFormOptions,
  render: function Render({ form }) {
    return (
      <fieldset>
        <form.AppField
          name="postLoginMode"
          children={(field) => (
            <field.SelectField
              label="Post Login"
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
          // Listen to changes in postLoginMode and render the appropriate content
          selector={(state) => state.values.postLoginMode}
          children={(postLoginMode) => {
            return (
              <>
                {/* Default mode */}
                {postLoginMode === "default" ? (
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
                {postLoginMode === "current" ? (
                  <p>
                    Only use with <strong>popup</strong> login embeds.
                  </p>
                ) : null}

                {/* Page mode */}
                <form.AppField
                  name="postLoginPagePath"
                  children={(field) => {
                    if (postLoginMode !== "page") return null;
                    return <field.PageSelectField label="&nbsp;" />;
                  }}
                />

                {/* Custom mode */}
                <form.AppField
                  name="postLoginCustomUrl"
                  children={(field) => {
                    if (postLoginMode !== "custom") return null;
                    return (
                      <field.TextField
                        label="&nbsp;"
                        placeholder="https://example.com/login-success"
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
