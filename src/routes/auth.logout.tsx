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
        label="Copy Popup Url to clipboard"
        text={postLogoutPath + "#o-logout-link"}
      />

      <p>
        and paste the url as the "link to" value making sure open in new tab is
        not enabled.
      </p>
    </form>
  );
}
