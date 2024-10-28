import { createFileRoute } from "@tanstack/react-router";

import { CopyButton, PageListControls } from "../common";
import { useState } from "react";

export const Route = createFileRoute("/auth/logout")({
  component: AuthLogoutPage,
});

export function AuthLogoutPage() {
  const [postLogoutPath, setPostLogoutPath] = useState<string>("/");

  return (
    <form>
      <PageListControls
        title="Post Logout Path"
        value={postLogoutPath}
        onChange={(value) => setPostLogoutPath(value)}
      />

      <CopyButton
        label="Copy popup url to clipboard"
        text={postLogoutPath + "#o-logout-link"}
      />

      <p>
        Paste the copied url as the <strong>Link To</strong> value
        <br /> and set <strong>New Tab</strong> to <em>No</em>.
      </p>
    </form>
  );
}
