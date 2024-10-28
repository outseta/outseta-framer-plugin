import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button, TextControls } from "@triozer/framer-toolbox";

import { setCustomCode, useCustomCode } from "../custom-code";
import { PageListControls } from "../common";

export const Route = createFileRoute("/custom-code/")({
  component: CustomCode,
});

function CustomCode() {
  const navigate = useNavigate();

  const customCode = useCustomCode();

  const [domain, setDomain] = useState<string>(customCode.domain);
  const [postLoginPath, setPostLoginPath] = useState<string>(
    customCode.postLoginPath,
  );
  const [postSignupPath, setPostSignupPath] = useState<string>(
    customCode.postSignupPath,
  );

  const mutation = useMutation({
    mutationFn: setCustomCode,
    onSuccess: () => navigate({ to: "/", from: Route.fullPath }),
  });

  const domainHasChanged = domain !== customCode.domain;
  const postLoginPathHasChanged = postLoginPath !== customCode.postLoginPath;
  const postSignupPathHasChanged = postSignupPath !== customCode.postSignupPath;
  const nothingHasChanged =
    !domainHasChanged && !postLoginPathHasChanged && !postSignupPathHasChanged;
  const disabled =
    !domain || nothingHasChanged || !domain.includes(".outseta.com");

  return (
    <form
      onSubmit={async (event: FormEvent) => {
        event.preventDefault();
        if (!domain) return;

        mutation.mutate({ domain, postLoginPath, postSignupPath });
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

      <PageListControls
        title="Post Login Path"
        value={postLoginPath}
        onChange={(value) => setPostLoginPath(value)}
      />

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
