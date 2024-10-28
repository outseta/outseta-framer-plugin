import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button, ListControls } from "@triozer/framer-toolbox";
import { useMutation } from "@tanstack/react-query";

import {
  upsertProfileEmbed,
  ProfileTabOptions,
  ProfileTabOptionLabels,
  ProfileTabOption,
  ProfileEmbedConfig,
  profilePopupUrl,
} from "../outseta";
import {
  useEmbedMode,
  useSingleOutsetaEmbedSelection,
  useSingleSupportsLinkSelection,
} from "../app-state";
import { CopyButton, EmbedModeListControls } from "../common";
import { useConfiguration } from "../custom-code";

export const Route = createFileRoute("/user/")({
  component: User,
});

function User() {
  const { embedMode } = useEmbedMode();
  const { domain } = useConfiguration();
  const singleSupportsLink = useSingleSupportsLinkSelection();
  const singleOutsetaEmbed = useSingleOutsetaEmbedSelection();

  const [tab, setTab] = useState<ProfileTabOption>("profile");

  const config: ProfileEmbedConfig = { tab };

  useEffect(() => {
    const tab = singleOutsetaEmbed?.controls.profileDefaultTab;
    setTab((tab as ProfileTabOption) || "profile");
  }, [singleOutsetaEmbed?.controls.profileDefaultTab]);

  const embedMutation = useMutation({
    mutationFn: () => upsertProfileEmbed(config, singleOutsetaEmbed),
  });

  const popupMutation = useMutation({
    mutationFn: () => {
      if (!singleSupportsLink) return Promise.resolve(null);
      return singleSupportsLink.setAttributes({
        link: profilePopupUrl(config, domain),
        linkOpenInNewTab: false,
      });
    },
  });

  return (
    <form
      onChange={() => {
        if (!singleOutsetaEmbed) return;
        embedMutation.mutate();
      }}
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

      <ListControls
        title="Default Tab"
        items={ProfileTabOptions.map((option) => ({
          value: option,
          label: ProfileTabOptionLabels[option],
        }))}
        value={tab}
        onChange={(value) => setTab(value)}
      />

      {embedMode === "embed" && !singleOutsetaEmbed && (
        <Button variant="primary">Add Profile Embed to page</Button>
      )}

      {embedMode === "popup" && singleSupportsLink && (
        <Button variant="primary">Set Profile Popup Link</Button>
      )}

      {embedMode === "popup" && !singleSupportsLink && (
        <>
          <CopyButton
            label={`Copy Popup Url to clipboard`}
            text={profilePopupUrl(config, domain)}
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
