import { createFileRoute } from "@tanstack/react-router";
import { addSupportEmbed, supportPopupUrl } from "../outseta";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@triozer/framer-toolbox";
import { useEmbedMode, useSingleOutsetaEmbedSelection } from "../app-state";
import { EmbedModeListControls, PopupLinkFormSection } from "../common";
import { useConfiguration } from "../custom-code";

export const Route = createFileRoute("/support/")({
  component: Support,
});

function Support() {
  const { embedMode } = useEmbedMode();
  const { domain } = useConfiguration();
  const singleOutsetaEmbedSelection = useSingleOutsetaEmbedSelection();

  const embedMutation = useMutation({
    mutationFn: () => addSupportEmbed(),
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
        <Button variant="primary">Add Support Embed to page</Button>
      )}

      <PopupLinkFormSection popupUrl={supportPopupUrl(domain)} />
    </form>
  );
}
