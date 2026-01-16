import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@triozer/framer-toolbox";
import { revalidateLogic, useForm } from "@tanstack/react-form";

import {
  upsertAuthEmbed,
  loginAuthPopupUrl,
  AuthEmbedConfig,
} from "../outseta";
import { EmbedModeListControls, PopupLinkFormSection } from "../common";
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

  const form = useForm({
    defaultValues: {},
    validationLogic: revalidateLogic({ mode: "submit", modeAfterSubmission: "change" }),
    onSubmit: async () => {
      switch (embedMode) {
        case "embed":
          await embedMutation.mutateAsync();
          break;
        case "popup":
          await popupMutation.mutateAsync();
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
      <EmbedModeListControls disabled={!!singleOutsetaEmbed} />

      {embedMode === "embed" && !singleOutsetaEmbed && (
        <Button variant="primary" disabled={embedMutation.isPending}>
          Add Login Embed to page
        </Button>
      )}

      {embedMode === "popup" && (
        <PopupLinkFormSection popupUrl={loginAuthPopupUrl(domain)} />
      )}
    </form>
  );
}
