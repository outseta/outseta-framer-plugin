import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Button,
  SegmentedControls,
  TextControls,
} from "@triozer/framer-toolbox";

import { setCustomCode, useCustomCode } from "../custom-code";
import { PageListControls } from "../common";

export const Route = createFileRoute("/custom-code/")({
  component: CustomCode,
});

function CustomCode() {
  const navigate = useNavigate();

  const customCode = useCustomCode();
  const [config, setConfig] = useState({
    domain: customCode.domain,

    overrideLoginPath: customCode.domain
      ? Boolean(customCode.postLoginPath)
      : true,
    postLoginPath: customCode.postLoginPath || "",

    overrideSignupPath: customCode.domain
      ? Boolean(customCode.postSignupPath)
      : false, // uses message if false
    postSignupPath: customCode.postSignupPath || "",
  });

  const mutation = useMutation({
    mutationFn: setCustomCode,
    onSuccess: () => navigate({ to: "/", from: Route.fullPath }),
  });

  const domainHasChanged = config.domain !== customCode.domain;
  const postLoginPathHasChanged =
    config.postLoginPath !== customCode.postLoginPath;
  const postSignupPathHasChanged =
    config.postSignupPath !== customCode.postSignupPath;
  const nothingHasChanged =
    !domainHasChanged && !postLoginPathHasChanged && !postSignupPathHasChanged;
  const disabled =
    !config.domain ||
    nothingHasChanged ||
    !config.domain.includes(".outseta.com");

  return (
    <form
      onSubmit={async (event: FormEvent) => {
        event.preventDefault();
        if (!config.domain) return;

        mutation.mutate(config);
      }}
    >
      <TextControls
        title="Outseta Domain"
        placeholder="your-domain.outseta.com"
        value={config.domain}
        required
        onChange={(value) => setConfig({ ...config, domain: value })}
      ></TextControls>

      {!customCode.domain && (
        <p>
          <a href="https://outseta.com" target="_blank">
            Sign up
          </a>{" "}
          for an account or{" "}
          <a href="https://go.outseta.com/#/login" target="_blank">
            login
          </a>{" "}
          to your existing acount to find your domain.
        </p>
      )}

      <SegmentedControls
        title="Post Login"
        items={[
          { value: false, label: "Same path" },
          { value: true, label: "Go to path" },
        ]}
        value={Boolean(config.postLoginPath)}
        onChange={(value) => {
          if (value) {
            setConfig({ ...config, postLoginPath: "/" });
          } else {
            setConfig({ ...config, postLoginPath: "" });
          }
        }}
      />

      {!Boolean(config.postLoginPath) && (
        <p>
          <small>
            The user stays on the same page, works best with popup embeds.
          </small>
        </p>
      )}

      {Boolean(config.postLoginPath) && (
        <PageListControls
          title="Post Login Path"
          value={config.postLoginPath}
          onChange={(value) => setConfig({ ...config, postLoginPath: value })}
        />
      )}

      <SegmentedControls
        title="Post Signup"
        items={[
          { value: false, label: "Show message" },
          { value: true, label: "Go to path" },
        ]}
        value={Boolean(config.postSignupPath)}
        onChange={(value) => {
          if (value) {
            setConfig({ ...config, postSignupPath: "/" });
          } else {
            setConfig({ ...config, postSignupPath: "" });
          }
        }}
      />

      {!Boolean(config.postSignupPath) && (
        <p>
          <small>
            A confirmation message shows in the embed as the last step.
          </small>
        </p>
      )}

      {Boolean(config.postSignupPath) && (
        <PageListControls
          title="Post Signup Path"
          value={config.postSignupPath}
          onChange={(value) => setConfig({ ...config, postSignupPath: value })}
        />
      )}

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
            Overrides the values set in{" "}
            <em>
              {
                "Auth > Sign up and Login > Post Login URL, Post Signup URL and Signup Confirmation URL"
              }
            </em>{" "}
            for your convinience working with multiple domains in Framer.
          </small>
        </p>
      </div>
    </form>
  );
}
