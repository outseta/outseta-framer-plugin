import { createFileRoute } from "@tanstack/react-router";
import {
  addSupportEmbed,
  supportPopupUrl,
  useCanUpsertEmbed,
} from "../outseta";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@triozer/framer-toolbox";
import { useEmbedMode, useSingleOutsetaEmbedSelection } from "../app-state";
import {
  EmbedModeListControls,
  PermissionNotice,
  PopupLinkFormSection,
} from "../common";
import { notifyMutationError } from "../framer/permissions";
import { useConfiguration } from "../custom-code";

export const Route = createFileRoute("/support/")({
  component: Support,
});

function Support() {
  const { embedMode } = useEmbedMode();
  const { domain } = useConfiguration();
  const singleOutsetaEmbedSelection = useSingleOutsetaEmbedSelection();
  const canAddEmbed = useCanUpsertEmbed();

  const embedMutation = useMutation({
    mutationFn: () => addSupportEmbed(),
    onError: notifyMutationError("add the support embed"),
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
      <EmbedModeListControls disabled={!!singleOutsetaEmbedSelection} />

      {embedMode === "embed" && !singleOutsetaEmbedSelection && (
        <Button variant="primary" disabled={!canAddEmbed}>
          Add Support Embed to page
        </Button>
      )}

      {embedMode === "embed" &&
        !singleOutsetaEmbedSelection &&
        !canAddEmbed && <PermissionNotice action="add component embeds" />}

      <PopupLinkFormSection popupUrl={supportPopupUrl(domain)} />
    </form>
  );
}
