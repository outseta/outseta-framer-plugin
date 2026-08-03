import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button, ListControls } from "@triozer/framer-toolbox";
import { useMutation } from "@tanstack/react-query";

import {
  upsertProfileEmbed,
  useCanUpsertEmbed,
  ProfileTabOptions,
  ProfileTabOptionLabels,
  ProfileTabOption,
  ProfileEmbedConfig,
  profilePopupUrl,
} from "../outseta";
import {
  useEmbedMode,
  useSingleOutsetaEmbedSelection,
} from "../app-state";
import {
  EmbedModeListControls,
  PermissionNotice,
  PopupLinkFormSection,
} from "../common";
import { notifyMutationError } from "../framer/permissions";
import { useConfiguration } from "../custom-code";

export const Route = createFileRoute("/user/")({
  component: User,
});

function User() {
  const { embedMode } = useEmbedMode();
  const { domain } = useConfiguration();
  const singleOutsetaEmbed = useSingleOutsetaEmbedSelection();
  const canUpsertEmbed = useCanUpsertEmbed(singleOutsetaEmbed);

  const [tab, setTab] = useState<ProfileTabOption>("profile");

  const config: ProfileEmbedConfig = { tab };

  useEffect(() => {
    const tab = singleOutsetaEmbed?.controls.profileDefaultTab;
    setTab((tab as ProfileTabOption) || "profile");
  }, [singleOutsetaEmbed?.controls.profileDefaultTab]);

  const embedMutation = useMutation({
    mutationFn: () => upsertProfileEmbed(config, singleOutsetaEmbed),
    onError: notifyMutationError("save the profile embed"),
    throwOnError: false,
  });

  return (
    <form
      onChange={() => {
        if (!singleOutsetaEmbed || !canUpsertEmbed) return;
        embedMutation.mutate();
      }}
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

      <ListControls
        title="Default Tab"
        items={ProfileTabOptions.map((option) => ({
          value: option,
          label: ProfileTabOptionLabels[option],
        }))}
        value={tab}
        onChange={(value) => setTab(value)}
        disabled={!!singleOutsetaEmbed && !canUpsertEmbed}
      />

      {embedMode === "embed" && !singleOutsetaEmbed && (
        <Button variant="primary" disabled={!canUpsertEmbed}>
          Add Profile Embed to page
        </Button>
      )}

      {embedMode === "embed" && !canUpsertEmbed && (
        <PermissionNotice action="add or update component embeds" />
      )}

      {embedMode === "popup" && (
        <PopupLinkFormSection popupUrl={profilePopupUrl(config, domain)} />
      )}
    </form>
  );
}
