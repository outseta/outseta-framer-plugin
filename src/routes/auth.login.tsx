import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@triozer/framer-toolbox";

import {
  upsertAuthEmbed,
  loginAuthPopupUrl,
  AuthEmbedConfig,
} from "../outseta";
import { CopyButton, EmbedModeListControls } from "../common";
import {
  useEmbedMode,
  useSingleOutsetaEmbedSelection,
  useSingleSupportsLinkSelection,
} from "../app-state";
import { useConfiguration } from "../custom-code";

export const Route = createFileRoute("/auth/login")({
  component: AuthLoginPage,
});

export function AuthLoginPage() {
  const { embedMode } = useEmbedMode();
  const { domain } = useConfiguration();
  const singleSupportsLink = useSingleSupportsLinkSelection();
  const singleOutsetaEmbed = useSingleOutsetaEmbedSelection();

  const config: AuthEmbedConfig = { widgetMode: "login" };

  const embedMutation = useMutation({
    mutationFn: () => upsertAuthEmbed(config, singleOutsetaEmbed),
  });

  const popupMutation = useMutation({
    mutationFn: () => {
      if (!singleSupportsLink) return Promise.resolve(null);
      return singleSupportsLink.setAttributes({
        link: loginAuthPopupUrl(domain),
        linkOpenInNewTab: false,
      });
    },
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();

        switch (embedMode) {
          case "embed":
            embedMutation.mutate();
            break;
          case "popup":
            popupMutation.mutate();
            break;
        }
      }}
    >
      <EmbedModeListControls disabled={!!singleOutsetaEmbed} />

      {embedMode === "embed" && !singleOutsetaEmbed && (
        <Button variant="primary">Add Login Embed to page</Button>
      )}

      {embedMode === "popup" && singleSupportsLink && (
        <Button variant="primary">Set Login Popup Link</Button>
      )}

      {embedMode === "popup" && !singleSupportsLink && (
        <>
          <CopyButton
            label={`Copy Popup Url to clipboard`}
            text={loginAuthPopupUrl(domain)}
          />
          <p>
            and paste the url as the "link to" value making sure open in new tab
            is not enabled.
          </p>
        </>
      )}
    </form>
  );
}
