import { useEffect, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button, ListControls } from "@triozer/framer-toolbox";
import { useMutation } from "@tanstack/react-query";
import { revalidateLogic, useForm } from "@tanstack/react-form";

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

  const form = useForm({
    defaultValues: {
      tab:
        ((singleOutsetaEmbed?.controls.profileDefaultTab as ProfileTabOption) ||
          "profile") as ProfileTabOption,
    },
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

  const config: ProfileEmbedConfig = {
    tab: (form.useStore((s) => s.values.tab) as ProfileTabOption) || "profile",
  };

  // Sync form value when embed control changes
  useEffect(() => {
    const next =
      ((singleOutsetaEmbed?.controls.profileDefaultTab as ProfileTabOption) ||
        "profile") as ProfileTabOption;
    if (form.state.values.tab !== next) {
      form.setFieldValue("tab", next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Auto-apply on tab change when an embed exists
  const didInit = useRef(false);
  const selectedTab = form.useStore((s) => s.values.tab) as ProfileTabOption;
  useEffect(() => {
    if (!didInit.current) {
      didInit.current = true;
      return;
    }
    if (!singleOutsetaEmbed) return;
    embedMutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTab, singleOutsetaEmbed]);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        form.handleSubmit();
      }}
    >
      <EmbedModeListControls disabled={!!singleOutsetaEmbed} />

      <form.Field name="tab">
        {(field) => (
          <ListControls
            title="Default Tab"
            items={ProfileTabOptions.map((option) => ({
              value: option,
              label: ProfileTabOptionLabels[option],
            }))}
            value={field.state.value as ProfileTabOption}
            onChange={(value) => field.handleChange(value)}
            onBlur={field.handleBlur}
          />
        )}
      </form.Field>

      {embedMode === "embed" && !singleOutsetaEmbed && (
        <Button variant="primary" disabled={embedMutation.isPending}>
          Add Profile Embed to page
        </Button>
      )}

      {embedMode === "popup" && singleSupportsLink && (
        <Button variant="primary" disabled={popupMutation.isPending}>
          Set Profile Popup Link
        </Button>
      )}

      {embedMode === "popup" && !singleSupportsLink && (
        <>
          <CopyButton
            label={`Copy Popup Url to clipboard`}
            text={profilePopupUrl(config, domain)}
          />
          <p>
            Paste the copied url as the <strong>Link To</strong> value
            <br /> and set <strong>New Tab</strong> to <em>No</em>.
          </p>
        </>
      )}
    </form>
  );
}
