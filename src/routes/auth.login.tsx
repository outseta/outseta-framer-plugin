import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@triozer/framer-toolbox";

import {
  upsertAuthEmbed,
  useCanUpsertEmbed,
  loginAuthPopupUrl,
  AuthEmbedConfig,
} from "../outseta";
import {
  EmbedModeListControls,
  PermissionNotice,
  PopupLinkFormSection,
} from "../common";
import { notifyMutationError } from "../framer/permissions";
import {
  useEmbedMode,
  useSingleOutsetaEmbedSelection,
} from "../app-state";
import { useConfiguration } from "../custom-code";

export const Route = createFileRoute("/auth/login")({
  component: AuthLoginPage,
});

export function AuthLoginPage() {
  const { embedMode } = useEmbedMode();
  const { domain } = useConfiguration();
  const singleOutsetaEmbed = useSingleOutsetaEmbedSelection();
  const canUpsertEmbed = useCanUpsertEmbed(singleOutsetaEmbed);

  const config: AuthEmbedConfig = { widgetMode: "login" };

  const embedMutation = useMutation({
    mutationFn: () => upsertAuthEmbed(config, singleOutsetaEmbed),
    onError: notifyMutationError("save the login embed"),
    throwOnError: false,
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();

        switch (embedMode) {
          case "embed":
            embedMutation.mutate();
            break;
        }
      }}
    >
      <EmbedModeListControls disabled={!!singleOutsetaEmbed} />

      {embedMode === "embed" && !singleOutsetaEmbed && (
        <Button variant="primary" disabled={!canUpsertEmbed}>
          Add Login Embed to page
        </Button>
      )}

      {embedMode === "embed" && !canUpsertEmbed && (
        <PermissionNotice action="add or update component embeds" />
      )}

      {embedMode === "popup" && (
        <PopupLinkFormSection popupUrl={loginAuthPopupUrl(domain)} />
      )}
    </form>
  );
}
