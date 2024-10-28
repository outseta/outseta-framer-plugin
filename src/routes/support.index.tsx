import { createFileRoute } from "@tanstack/react-router";
import { addSupportEmbed, supportPopupUrl } from "../outseta";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@triozer/framer-toolbox";
import {
  useEmbedMode,
  useSingleOutsetaEmbedSelection,
  useSingleSupportsLinkSelection,
} from "../app-state";
import { CopyButton, EmbedModeListControls } from "../common";
import { useConfiguration } from "../custom-code";

export const Route = createFileRoute("/support/")({
  component: Support,
});

function Support() {
  const { embedMode } = useEmbedMode();
  const { domain } = useConfiguration();
  const singleSupportsLink = useSingleSupportsLinkSelection();
  const singleOutsetaEmbedSelection = useSingleOutsetaEmbedSelection();

  const embedMutation = useMutation({
    mutationFn: () => addSupportEmbed(),
  });

  const popupMutation = useMutation({
    mutationFn: ({ domain }: { domain: string }) => {
      if (!singleSupportsLink) return Promise.resolve(null);
      return singleSupportsLink.setAttributes({
        link: supportPopupUrl(domain),
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
            popupMutation.mutate({ domain: domain });
            break;
        }
      }}
    >
      <EmbedModeListControls disabled={!!singleOutsetaEmbedSelection} />

      {embedMode === "embed" && !singleOutsetaEmbedSelection && (
        <Button variant="primary">Add Support Embed to page</Button>
      )}

      {embedMode === "popup" && singleSupportsLink && (
        <Button variant="primary">Set Support Ticket Popup Link</Button>
      )}
      {embedMode === "popup" && !singleSupportsLink && (
        <>
          <CopyButton
            label={`Copy Popup Url to clipboard`}
            text={supportPopupUrl(domain)}
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
