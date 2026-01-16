import { createFileRoute } from "@tanstack/react-router";
import { addSupportEmbed, supportPopupUrl } from "../outseta";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@triozer/framer-toolbox";
import { revalidateLogic, useForm } from "@tanstack/react-form";
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

  const form = useForm({
    defaultValues: {},
    validationLogic: revalidateLogic({ mode: "submit", modeAfterSubmission: "change" }),
    onSubmit: async () => {
      switch (embedMode) {
        case "embed":
          await embedMutation.mutateAsync();
          break;
      }
    },
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        form.handleSubmit();
      }}
    >
      <EmbedModeListControls disabled={!!singleOutsetaEmbedSelection} />

      {embedMode === "embed" && !singleOutsetaEmbedSelection && (
        <Button variant="primary" disabled={embedMutation.isPending}>
          Add Support Embed to page
        </Button>
      )}

      <PopupLinkFormSection popupUrl={supportPopupUrl(domain)} />
    </form>
  );
}
