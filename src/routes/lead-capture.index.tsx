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
import { useEmbedMode, useSingleOutsetaEmbedSelection } from "../app-state";
import { EmbedModeListControls, Alert, PopupLinkFormSection } from "../common";

export const Route = createFileRoute("/lead-capture/")({
  component: LeadCaptureIndex,
});

export function LeadCaptureIndex() {
  const { embedMode } = useEmbedMode();
  const { domain, isInvalid } = useConfiguration();

  const singleOutsetaEmbed = useSingleOutsetaEmbedSelection();

  const query = useQuery({
    queryKey: ["outseta", "lead-capture", "all", domain],
    queryFn: () => getLeadCaptureData(domain),
    enabled: !!domain && !isInvalid,
  });

  const [uid, setUid] = useState<string | undefined>(undefined);

  const leadCaptures = query.data?.items;
  const defaultUid = leadCaptures?.[0]?.Uid;

  const config: LeadCaptureEmbedConfig = { uid: uid || defaultUid || "" };

  useEffect(() => {
    const uid = singleOutsetaEmbed?.controls.leadCaptureUid as string;
    setUid(uid);
  }, [singleOutsetaEmbed?.controls.leadCaptureUid]);

  const embedMutation = useMutation({
    mutationFn: () => upsertLeadCaptureEmbed(config, singleOutsetaEmbed),
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

      <PopupLinkFormSection popupUrl={leadCapturePopupUrl(config, domain)} />

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
