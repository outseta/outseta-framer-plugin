import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, ListControls } from "@triozer/framer-toolbox";

import { useConfiguration } from "../custom-code";
import {
  upsertLeadCaptureEmbed,
  getLeadCaptureData,
  LeadCaptureEmbedConfig,
  leadCapturePopupUrl,
} from "../outseta";
import {
  useEmbedMode,
  useSingleOutsetaEmbedSelection,
  useSingleSupportsLinkSelection,
} from "../app-state";
import { EmbedModeListControls, Alert, CopyButton } from "../common";

export const Route = createFileRoute("/lead-capture/")({
  component: LeadCaptureIndex,
});

export function LeadCaptureIndex() {
  const { embedMode } = useEmbedMode();
  const { domain, isInvalid } = useConfiguration();
  const singleSupportsLink = useSingleSupportsLinkSelection();
  const singleOutsetaEmbed = useSingleOutsetaEmbedSelection();

  const query = useQuery({
    queryKey: ["outseta", "lead-capture", "all", domain],
    queryFn: () => getLeadCaptureData(domain),
    enabled: !!domain && !isInvalid,
  });

  const [uid, setUid] = useState<string | undefined>(undefined);

  const leadCaptures = query.data?.items;
  const defaultUid = leadCaptures?.[0]?.Uid;
  const disablePopup = !defaultUid;

  const config: LeadCaptureEmbedConfig = { uid: uid || defaultUid || "" };

  useEffect(() => {
    const uid = singleOutsetaEmbed?.controls.leadCaptureUid as string;
    setUid(uid);
  }, [singleOutsetaEmbed?.controls.leadCaptureUid]);

  const embedMutation = useMutation({
    mutationFn: () => upsertLeadCaptureEmbed(config, singleOutsetaEmbed),
  });

  const popupMutation = useMutation({
    mutationFn: () => {
      if (!singleSupportsLink) return Promise.resolve(null);
      return singleSupportsLink.setAttributes({
        link: leadCapturePopupUrl(config, domain),
        linkOpenInNewTab: false,
      });
    },
  });

  const items =
    query.data?.items.map((item) => ({
      value: item.Uid,
      label: item.Name,
    })) || [];

  if (uid !== undefined && query.isSuccess) {
    // After the query has succeeded
    if (!items.find((item) => item.value === uid)) {
      // Check if the uid is valid and if not add an invalid item to the top of the list
      items.unshift({
        value: uid,
        label: `Invalid  - ${uid ? uid : "empty"}`,
      });
    }
  }

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
        title="Lead Capture"
        items={items}
        value={uid === undefined ? defaultUid : uid}
        onChange={(value) => setUid(value)}
        disabled={items.length === 0}
      />

      {embedMode === "embed" && !singleOutsetaEmbed && (
        <Button>Add Lead Capture Embed to page</Button>
      )}

      {embedMode === "popup" && singleSupportsLink && (
        <Button disabled={disablePopup}>Set Lead Capture Popup Link</Button>
      )}

      {embedMode === "popup" && !singleSupportsLink && (
        <>
          <CopyButton
            label={`Copy Popup Url to clipboard`}
            text={leadCapturePopupUrl(config, domain)}
            disabled={disablePopup}
          />
          {!disablePopup && (
            <p>
              and paste the url as the "link to" value making sure open in new
              tab is not enabled.
            </p>
          )}
        </>
      )}

      {domain && leadCaptures?.length === 0 && (
        <Alert level="warning">
          Add a{" "}
          <a href={`https://${domain}/#/app/email/forms/`} target="_blank">
            lead capture form in Outseta
          </a>{" "}
          to start collecting leads.
        </Alert>
      )}
    </form>
  );
}
