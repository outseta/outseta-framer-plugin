import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
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

// Helper to extract mode from config
const getMode = (config: AuthCallbackConfig) => config.mode;

// Helper to extract page path from config
const getPagePath = (config: AuthCallbackConfig): string => {
  return config.mode === "page" ? config.path : "";
};

// Helper to extract custom URL from config
const getCustomUrl = (config: AuthCallbackConfig): string => {
  return config.mode === "custom" ? config.path : "";
};

function CustomCode() {
  const navigate = useNavigate();

  const customCode = useCustomCode();

  const [domain, setDomain] = useState<string>(customCode.domain);
  const [authCallbackMode, setAuthCallbackMode] = useState<
    AuthCallbackConfig["mode"]
  >(getMode(customCode.authCallbackConfig));
  const [authCallbackPagePath, setAuthCallbackPagePath] = useState<string>(
    getPagePath(customCode.authCallbackConfig),
  );
  const [authCallbackCustomUrl, setAuthCallbackCustomUrl] = useState<string>(
    getCustomUrl(customCode.authCallbackConfig),
  );
  const [postSignupPath, setPostSignupPath] = useState<string>(
    customCode.postSignupPath,
  );

  const mutation = useMutation({
    mutationFn: setCustomCode,
    onSuccess: () => navigate({ to: "/", from: Route.fullPath }),
  });

  const domainHasChanged = domain !== customCode.domain;
  const authCallbackModeHasChanged =
    authCallbackMode !== getMode(customCode.authCallbackConfig);

  // Check the appropriate path based on current mode
  const authCallbackPagePathHasChanged =
    authCallbackMode === "page" &&
    authCallbackPagePath !== getPagePath(customCode.authCallbackConfig);
  const authCallbackCustomUrlHasChanged =
    authCallbackMode === "custom" &&
    authCallbackCustomUrl !== getCustomUrl(customCode.authCallbackConfig);
  const authCallbackPathHasChanged =
    authCallbackPagePathHasChanged || authCallbackCustomUrlHasChanged;

  const postSignupPathHasChanged = postSignupPath !== customCode.postSignupPath;
  const nothingHasChanged =
    !domainHasChanged &&
    !authCallbackModeHasChanged &&
    !authCallbackPathHasChanged &&
    !postSignupPathHasChanged;
  const disabled =
    !domain || nothingHasChanged || !domain.includes(".outseta.com");

  return (
    <form
      onSubmit={async (event: FormEvent) => {
        event.preventDefault();
        if (!domain) return;

        // Build the config object based on mode
        let authCallbackConfig: AuthCallbackConfig;
        if (authCallbackMode === "default") {
          authCallbackConfig = { mode: "default" };
        } else if (authCallbackMode === "current") {
          authCallbackConfig = { mode: "current" };
        } else if (authCallbackMode === "page") {
          authCallbackConfig = { mode: "page", path: authCallbackPagePath };
        } else {
          authCallbackConfig = { mode: "custom", path: authCallbackCustomUrl };
        }

        mutation.mutate({
          domain,
          authCallbackConfig,
          postSignupPath,
        });
      }}
    >
      <TextControls
        title="Outseta Domain"
        placeholder="your-domain.outseta.com"
        value={domain}
        required
        onChange={(value) => setDomain(value)}
      ></TextControls>

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
        <ListControls
          title="Post Login Path"
          items={[
            { label: "As Configured in Outseta", value: "default" },
            { label: "The Current Page", value: "current" },
            { label: "Framer Page", value: "page" },
            { label: "Custom URL", value: "custom" },
          ]}
          required
          value={authCallbackMode}
          onChange={(value) =>
            setAuthCallbackMode(value as AuthCallbackConfig["mode"])
          }
        />

        {authCallbackMode === "page" && (
          <PageListControls
            title="&nbsp;"
            value={authCallbackPagePath}
            required
            onChange={(value) => setAuthCallbackPagePath(value)}
          />
        )}

        {authCallbackMode === "custom" && (
          <TextControls
            title="&nbsp;"
            placeholder="https://example.com/login-success"
            value={authCallbackCustomUrl}
            required
            onChange={(value) => setAuthCallbackCustomUrl(value)}
          />
        )}
      </fieldset>

      <PageListControls
        title="Post Signup Path"
        value={postSignupPath}
        onChange={(value) => setPostSignupPath(value)}
      />

      <Button variant="primary" disabled={disabled}>
        {customCode.domain ? "Update" : "Connect"}
      </Button>
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
