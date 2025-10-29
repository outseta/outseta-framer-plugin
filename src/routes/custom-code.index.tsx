import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { Button, TextControls, ListControls } from "@triozer/framer-toolbox";

import {
  setCustomCode,
  useCustomCode,
  type AuthCallbackConfig,
} from "../custom-code";

import { ExternalLink, PageListControls } from "../common";

export const Route = createFileRoute("/custom-code/")({
  component: CustomCode,
});

// Form data type
type CustomCodeFormData = {
  domain: string;
  authCallbackMode: AuthCallbackConfig["mode"];
  authCallbackPagePath: string;
  authCallbackCustomUrl: string;
  postSignupPath: string;
};

function CustomCode() {
  const navigate = useNavigate();
  const customCode = useCustomCode();

  const mutation = useMutation({
    mutationFn: setCustomCode,
    onSuccess: () => navigate({ to: "/", from: Route.fullPath }),
  });

  // Compute initial form values once
  const initialValues: CustomCodeFormData = {
    domain: customCode.domain || "",
    authCallbackMode: customCode.authCallbackConfig.mode,
    authCallbackPagePath:
      customCode.authCallbackConfig.mode === "page"
        ? customCode.authCallbackConfig.path
        : "",
    authCallbackCustomUrl:
      customCode.authCallbackConfig.mode === "custom"
        ? customCode.authCallbackConfig.url
        : "",
    postSignupPath: customCode.postSignupPath || "",
  };

  const form = useForm({
    defaultValues: initialValues,
    validators: {
      onSubmit: ({ value }) => {
        if (value.authCallbackMode === "page" && !value.authCallbackPagePath) {
          return {
            fields: {
              authCallbackPagePath: "Page path is required when mode is 'page'",
            },
          };
        }
        if (
          value.authCallbackMode === "custom" &&
          !value.authCallbackCustomUrl
        ) {
          return {
            fields: {
              authCallbackCustomUrl:
                "Custom URL is required when mode is 'custom'",
            },
          };
        }
        return undefined;
      },
    },
    onSubmit: async ({ value }) => {
      if (!value.domain) return;

      // Build the config object based on mode
      let authCallbackConfig: AuthCallbackConfig;
      if (value.authCallbackMode === "default") {
        authCallbackConfig = { mode: "default" };
      } else if (value.authCallbackMode === "current") {
        authCallbackConfig = { mode: "current" };
      } else if (value.authCallbackMode === "page") {
        authCallbackConfig = { mode: "page", path: value.authCallbackPagePath };
      } else {
        authCallbackConfig = {
          mode: "custom",
          url: value.authCallbackCustomUrl,
        };
      }

      mutation.mutate({
        domain: value.domain,
        authCallbackConfig,
        postSignupPath: value.postSignupPath,
      });
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <form.Field
        name="domain"
        validators={{
          onChange: ({ value }) => {
            if (!value) {
              return "Domain is required";
            }
            if (!value.includes(".outseta.com")) {
              return "Domain must include .outseta.com";
            }
            return undefined;
          },
        }}
      >
        {(field) => (
          <>
            <TextControls
              title="Outseta Domain"
              placeholder="your-domain.outseta.com"
              value={field.state.value}
              required
              onChange={(value) => field.handleChange(value)}
            />
            {field.state.meta.errors.length > 0 && (
              <p style={{ color: "red", fontSize: "0.875rem" }}>
                {field.state.meta.errors[0]}
              </p>
            )}
          </>
        )}
      </form.Field>

      {!customCode.domain && (
        <p>
          <ExternalLink href="https://outseta.com">Sign up</ExternalLink> for an
          account or{" "}
          <ExternalLink href="https://go.outseta.com/#/login">
            login
          </ExternalLink>{" "}
          to your existing acount to find your domain.
        </p>
      )}

      <fieldset>
        <form.Field
          name="authCallbackMode"
          validators={{
            onChange: ({ value }) => {
              if (!value) {
                return "Post Login Path is required";
              }
              return undefined;
            },
          }}
        >
          {(field) => (
            <ListControls
              title="Post Login Path"
              items={[
                { label: "As Configured in Outseta", value: "default" },
                { label: "The Current Page", value: "current" },
                { label: "Framer Page", value: "page" },
                { label: "Custom URL", value: "custom" },
              ]}
              required
              value={field.state.value}
              onChange={(value) =>
                field.handleChange(value as AuthCallbackConfig["mode"])
              }
            />
          )}
        </form.Field>

        <form.Subscribe
          selector={(state) => state.values.authCallbackMode}
          children={(authCallbackMode) => {
            if (authCallbackMode === "page") {
              return (
                <form.Field
                  name="authCallbackPagePath"
                  validators={{
                    onChange: ({ value }) => {
                      if (!value) {
                        return "Page path is required when mode is 'page'";
                      }
                      return undefined;
                    },
                  }}
                >
                  {(field) => (
                    <>
                      <PageListControls
                        title="&nbsp;"
                        value={field.state.value}
                        required
                        onChange={(value) => field.handleChange(value)}
                      />
                      {field.state.meta.errors.length > 0 && (
                        <p style={{ color: "red", fontSize: "0.875rem" }}>
                          {field.state.meta.errors[0]}
                        </p>
                      )}
                    </>
                  )}
                </form.Field>
              );
            }
            return null;
          }}
        />

        <form.Subscribe
          selector={(state) => state.values.authCallbackMode}
          children={(authCallbackMode) => {
            if (authCallbackMode === "custom") {
              return (
                <form.Field
                  name="authCallbackCustomUrl"
                  validators={{
                    onChange: ({ value }) => {
                      if (!value) {
                        return "Custom URL is required when mode is 'custom'";
                      }
                      return undefined;
                    },
                  }}
                >
                  {(field) => (
                    <>
                      <TextControls
                        title="&nbsp;"
                        placeholder="https://example.com/login-success"
                        value={field.state.value}
                        required
                        onChange={(value) => field.handleChange(value)}
                      />
                      {field.state.meta.errors.length > 0 && (
                        <p style={{ color: "red", fontSize: "0.875rem" }}>
                          {field.state.meta.errors[0]}
                        </p>
                      )}
                    </>
                  )}
                </form.Field>
              );
            }
            return null;
          }}
        />

        <form.Subscribe
          selector={(state) => state.values.authCallbackMode}
          children={(authCallbackMode) => (
            <>
              {authCallbackMode === "default" && (
                <p>
                  Redirect users to the URL configured in your{" "}
                  {customCode.domain ? (
                    <>
                      <ExternalLink
                        href={`https://${customCode.domain}/#/app/auth/sign-up-login`}
                      >
                        Outseta dashboard
                      </ExternalLink>
                    </>
                  ) : (
                    "Outseta dashboard"
                  )}
                  .
                </p>
              )}

              {authCallbackMode === "current" && (
                <p>Return users to the same page they logged in from.</p>
              )}

              {authCallbackMode === "page" && (
                <p>Return users to a specific Framer page (selected above).</p>
              )}

              {authCallbackMode === "custom" && (
                <p>Redirect users to a custom URL (configured above).</p>
              )}
            </>
          )}
        />
      </fieldset>

      <form.Field name="postSignupPath">
        {(field) => (
          <PageListControls
            title="Post Signup Path"
            value={field.state.value}
            onChange={(value) => field.handleChange(value)}
          />
        )}
      </form.Field>

      <form.Subscribe
        selector={(state) => {
          const values = state.values;
          const hasChanges =
            values.domain !== initialValues.domain ||
            values.authCallbackMode !== initialValues.authCallbackMode ||
            (values.authCallbackMode === "page" &&
              values.authCallbackPagePath !==
                initialValues.authCallbackPagePath) ||
            (values.authCallbackMode === "custom" &&
              values.authCallbackCustomUrl !==
                initialValues.authCallbackCustomUrl) ||
            values.postSignupPath !== initialValues.postSignupPath;

          const isValidDomain =
            values.domain && values.domain.includes(".outseta.com");

          return {
            canSubmit: hasChanges && isValidDomain && state.canSubmit,
            isSubmitting: state.isSubmitting,
          };
        }}
      >
        {({ canSubmit, isSubmitting }) => (
          <Button variant="primary" disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? "..." : customCode.domain ? "Update" : "Connect"}
          </Button>
        )}
      </form.Subscribe>

      <div>
        <p>
          Adds the Outseta script to the site's head and pulls in data for the
          account.
        </p>
        <p>
          <small>
            The Authentication Callback can use the default configured in
            Outseta <em>{"(Auth > Sign up and Login > Post Login URL)"}</em>,
            redirect to the current page, a Framer page, or a custom URL. Post
            Signup URL and Signup Confirmation URL are overridden for your
            convenience when working with multiple domains in Framer.
          </small>
        </p>
      </div>
    </form>
  );
}
