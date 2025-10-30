import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import {
  revalidateLogic,
  useForm,
  type AnyFieldApi,
} from "@tanstack/react-form";
import { z } from "zod";
import { Button, TextControls, ListControls } from "@triozer/framer-toolbox";

import {
  setCustomCode,
  useCustomCode,
  type AuthCallbackConfig,
  type PostSignupConfig,
} from "../custom-code";

import { ExternalLink, PageListControls } from "../common";

export const Route = createFileRoute("/custom-code/")({
  component: CustomCode,
});

const customCodeFormSchema = z.intersection(
  z.object({
    domain: z
      .hostname("An Outseta domain is required")
      .endsWith(
        ".outseta.com",
        "An Outseta domain is required, must end with .outseta.com",
      ),
  }),
  z.intersection(
    z.discriminatedUnion("authCallbackMode", [
    z.object({
      authCallbackMode: z.literal("default"),
      authCallbackPagePath: z.string().optional(),
      authCallbackCustomUrl: z.string().optional(),
    }),
    z.object({
      authCallbackMode: z.literal("current"),
      authCallbackPagePath: z.string().optional(),
      authCallbackCustomUrl: z.string().optional(),
    }),
    z.object({
      authCallbackMode: z.literal("page"),
      authCallbackPagePath: z.string().trim().nonempty(),
      authCallbackCustomUrl: z.string().optional(),
    }),
    z.object({
      authCallbackMode: z.literal("custom"),
      authCallbackPagePath: z.string().optional(),
      authCallbackCustomUrl: z.url("A valid URL is required"),
    }),
    ]),
    z.discriminatedUnion("postSignupMode", [
      z.object({
        postSignupMode: z.literal("default"),
        postSignupPagePath: z.string().optional(),
        postSignupCustomUrl: z.string().optional(),
      }),
      z.object({
        postSignupMode: z.literal("message"),
        postSignupPagePath: z.string().optional(),
        postSignupCustomUrl: z.string().optional(),
      }),
      z.object({
        postSignupMode: z.literal("page"),
        postSignupPagePath: z.string().trim().nonempty(),
        postSignupCustomUrl: z.string().optional(),
      }),
      z.object({
        postSignupMode: z.literal("custom"),
        postSignupPagePath: z.string().optional(),
        postSignupCustomUrl: z.url("A valid URL is required"),
      }),
    ]),
  ),
);

// Form data type
type CustomCodeFormData = z.infer<typeof customCodeFormSchema>;

function CustomCode() {
  const navigate = useNavigate();
  const customCode = useCustomCode();

  const mutation = useMutation({
    mutationFn: setCustomCode,
    onSuccess: () => navigate({ to: "/", from: Route.fullPath }),
  });

  // Compute initial form values once
  const getInitialValues = (): CustomCodeFormData => {
    const mode = customCode.authCallbackConfig.mode;
    const base = {
      domain: customCode.domain || "",
    };

    switch (mode) {
      case "page":
        return {
          ...base,
          authCallbackMode: "page" as const,
          authCallbackPagePath: customCode.authCallbackConfig.path || "",
          authCallbackCustomUrl: undefined,
          // post-signup defaults below will be overridden after
        };
      case "custom":
        return {
          ...base,
          authCallbackMode: "custom" as const,
          authCallbackPagePath: undefined,
          authCallbackCustomUrl: customCode.authCallbackConfig.url || "",
          // post-signup defaults below will be overridden after
        };
      case "current":
        return {
          ...base,
          authCallbackMode: "current" as const,
          authCallbackPagePath: undefined,
          authCallbackCustomUrl: undefined,
          // post-signup defaults below will be overridden after
        };
      default:
        return {
          ...base,
          authCallbackMode: "default" as const,
          authCallbackPagePath: undefined,
          authCallbackCustomUrl: undefined,
          // post-signup defaults below will be overridden after
        };
    }
  };

  // Start with auth values, then mix in post-signup initial values
  let initialValues = getInitialValues() as any;
  const ps = customCode.postSignupConfig;
  switch (ps.mode) {
    case "page":
      initialValues = {
        ...initialValues,
        postSignupMode: "page" as const,
        postSignupPagePath: ps.path,
        postSignupCustomUrl: undefined,
      };
      break;
    case "custom":
      initialValues = {
        ...initialValues,
        postSignupMode: "custom" as const,
        postSignupPagePath: undefined,
        postSignupCustomUrl: ps.url,
      };
      break;
    case "message":
      initialValues = {
        ...initialValues,
        postSignupMode: "message" as const,
        postSignupPagePath: undefined,
        postSignupCustomUrl: undefined,
      };
      break;
    default:
      initialValues = {
        ...initialValues,
        postSignupMode: "default" as const,
        postSignupPagePath: undefined,
        postSignupCustomUrl: undefined,
      };
  }

  const form = useForm({
    defaultValues: initialValues,
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "change",
    }),
    validators: {
      onDynamic: customCodeFormSchema,
    },
    onSubmit: async ({ value }) => {
      // Build the config object based on mode with proper type narrowing
      let authCallbackConfig: AuthCallbackConfig;
      switch (value.authCallbackMode) {
        case "default":
          authCallbackConfig = { mode: "default" };
          break;
        case "current":
          authCallbackConfig = { mode: "current" };
          break;
        case "page":
          authCallbackConfig = {
            mode: "page",
            path: value.authCallbackPagePath as string,
          };
          break;
        case "custom":
          authCallbackConfig = {
            mode: "custom",
            url: value.authCallbackCustomUrl as string,
          };
          break;
      }

      let postSignupConfig: PostSignupConfig;
      switch ((value as any).postSignupMode) {
        case "default":
          postSignupConfig = { mode: "default" };
          break;
        case "message":
          postSignupConfig = { mode: "message" };
          break;
        case "page":
          postSignupConfig = {
            mode: "page",
            path: (value as any).postSignupPagePath as string,
          };
          break;
        case "custom":
          postSignupConfig = {
            mode: "custom",
            url: (value as any).postSignupCustomUrl as string,
          };
          break;
        default:
          postSignupConfig = { mode: "default" };
      }

      mutation.mutate({
        domain: value.domain,
        authCallbackConfig,
        postSignupConfig,
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
      <form.Field name="domain">
        {(field) => (
          <fieldset>
            <TextControls
              title="Outseta Domain"
              placeholder="your-domain.outseta.com"
              value={field.state.value as string}
              required
              onBlur={field.handleBlur}
              onChange={(value) => field.handleChange(value)}
            />
            <FieldErrors field={field} />
            <p>
              <ExternalLink href="https://outseta.com">Sign up</ExternalLink>{" "}
              for an account or{" "}
              <ExternalLink href="https://go.outseta.com/#/login">
                login
              </ExternalLink>{" "}
              to your existing acount to find your domain.
            </p>
          </fieldset>
        )}
      </form.Field>

      <fieldset>
        <form.Field name="authCallbackMode">
          {(field) => (
            <ListControls
              title="Post Login Path"
              items={[
                { label: "As Configured in Outseta", value: "default" },
                { label: "The Current Page", value: "current" },
                { label: "Framer Page", value: "page" },
                { label: "Custom URL", value: "custom" },
              ]}
              value={field.state.value as AuthCallbackConfig["mode"]}
              onBlur={field.handleBlur}
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
                <form.Field name="authCallbackPagePath">
                  {(field) => (
                    <>
                      <PageListControls
                        title="&nbsp;"
                        value={(field.state.value as string | undefined) || ""}
                        onBlur={field.handleBlur}
                        onChange={(value) => field.handleChange(value)}
                      />
                      <FieldErrors field={field} />
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
                <form.Field name="authCallbackCustomUrl">
                  {(field) => (
                    <>
                      <TextControls
                        title="&nbsp;"
                        placeholder="https://example.com/login-success"
                        value={(field.state.value as string | undefined) || ""}
                        required
                        onBlur={field.handleBlur}
                        onChange={(value) => field.handleChange(value)}
                      />
                      <FieldErrors field={field} />
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

      <fieldset>
        <form.Field name="postSignupMode">
          {(field) => (
            <ListControls
              title="Post Signup URL"
              items={[
                { label: "As Configured in Outseta", value: "default" },
                { label: "In Signup Embed Message", value: "message" },
                { label: "Framer Page", value: "page" },
                { label: "Custom URL", value: "custom" },
              ]}
              value={field.state.value as PostSignupConfig["mode"]}
              onBlur={field.handleBlur}
              onChange={(value) =>
                field.handleChange(value as PostSignupConfig["mode"]) }
            />
          )}
        </form.Field>

        <form.Subscribe
          selector={(state) => (state.values as any).postSignupMode}
          children={(postSignupMode) => {
            if (postSignupMode === "page") {
              return (
                <form.Field name="postSignupPagePath">
                  {(field) => (
                    <>
                      <PageListControls
                        title="\u00A0"
                        value={(field.state.value as string | undefined) || ""}
                        onBlur={field.handleBlur}
                        onChange={(value) => field.handleChange(value)}
                      />
                      <FieldErrors field={field} />
                    </>
                  )}
                </form.Field>
              );
            }
            return null;
          }}
        />

        <form.Subscribe
          selector={(state) => (state.values as any).postSignupMode}
          children={(postSignupMode) => {
            if (postSignupMode === "custom") {
              return (
                <form.Field name="postSignupCustomUrl">
                  {(field) => (
                    <>
                      <TextControls
                        title="\u00A0"
                        placeholder="https://example.com/welcome"
                        value={(field.state.value as string | undefined) || ""}
                        required
                        onBlur={field.handleBlur}
                        onChange={(value) => field.handleChange(value)}
                      />
                      <FieldErrors field={field} />
                    </>
                  )}
                </form.Field>
              );
            }
            return null;
          }}
        />

        <form.Subscribe
          selector={(state) => (state.values as any).postSignupMode}
          children={(postSignupMode) => (
            <>
              {postSignupMode === "default" && (
                <p>
                  Use the URL configured in your
                  {" "}
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

              {postSignupMode === "message" && (
                <p>Show the post signup message in the signup embed.</p>
              )}

              {postSignupMode === "page" && (
                <p>Send users to a specific Framer page (selected above).</p>
              )}

              {postSignupMode === "custom" && (
                <p>Redirect users to a custom URL (configured above).</p>
              )}
            </>
          )}
        />
      </fieldset>

      <form.Subscribe selector={(state) => [state.isSubmitting]}>
        {([isSubmitting]) => (
          <Button variant="primary" disabled={isSubmitting}>
            {customCode.domain ? "Update Outseta Script" : "Add Outseta Script"}
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

function FieldErrors({ field }: { field: AnyFieldApi }) {
  if (field.state.meta.errors.length === 0) return null;
  if (!field.state.value) return null;

  const error = field.state.meta.errors[0];
  return (
    <p className="error">
      {typeof error === "string" && error}
      {typeof error !== "string" &&
        ((error as { message?: string })?.message || "Invalid value")}
    </p>
  );
}
