import { useEffect, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, ListControls } from "@triozer/framer-toolbox";
import { revalidateLogic, useForm } from "@tanstack/react-form";
import { z } from "zod";

import { useConfiguration } from "../custom-code";
import {
  upsertLeadCaptureEmbed,
  getLeadCaptureData,
  LeadCaptureEmbedConfig,
  leadCapturePopupUrl,
} from "../outseta";
import { useEmbedMode, useSingleOutsetaEmbedSelection } from "../app-state";
import {
  EmbedModeListControls,
  Alert,
  PopupLinkFormSection,
  ExternalLink,
} from "../common";

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

  const leadCaptures = query.data?.items;
  const defaultUid = leadCaptures?.[0]?.Uid;

  const currentUid = singleOutsetaEmbed?.controls.leadCaptureUid as
    | string
    | undefined;

  const form = useForm({
    defaultValues: {
      uid: (currentUid || defaultUid || "") as string,
    },
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "change",
    }),
    validators: {
      onSubmit: z.object({ uid: z.string().trim() }).optional(),
    },
    onSubmit: async ({ value }) => {
      const cfg: LeadCaptureEmbedConfig = { uid: value.uid };
      switch (embedMode) {
        case "embed":
          await embedMutation.mutateAsync();
          break;
      }
    },
  });

  // Keep form value in sync when controls or data load change
  useEffect(() => {
    const next = (currentUid || defaultUid || "") as string;
    if (form.state.values.uid !== next) {
      form.setFieldValue("uid", next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUid, defaultUid]);

  const config: LeadCaptureEmbedConfig = {
    uid: (form.useStore((s) => s.values.uid) as string) || "",
  };

  // Auto-apply on uid change when an embed exists
  const didInit = useRef(false);
  const selectedUid = form.useStore((s) => s.values.uid) as string | undefined;
  useEffect(() => {
    if (!didInit.current) {
      didInit.current = true;
      return;
    }
    if (!singleOutsetaEmbed) return;
    embedMutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUid, singleOutsetaEmbed]);

  const embedMutation = useMutation({
    mutationFn: () => upsertLeadCaptureEmbed(config, singleOutsetaEmbed),
  });

  const items =
    query.data?.items.map((item) => ({
      value: item.Uid,
      label: item.Name,
    })) || [];

  if (selectedUid !== undefined && query.isSuccess) {
    // After the query has succeeded
    if (!items.find((item) => item.value === selectedUid)) {
      // Check if the uid is valid and if not add an invalid item to the top of the list
      items.unshift({
        value: selectedUid,
        label: `Invalid  - ${selectedUid ? selectedUid : "empty"}`,
      });
    }
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        form.handleSubmit();
      }}
    >
      <EmbedModeListControls disabled={!!singleOutsetaEmbed} />

      <form.Field name="uid">
        {(field) => (
          <ListControls
            title="Lead Capture"
            items={items}
            value={(field.state.value as string | undefined) ?? defaultUid}
            onChange={(value) => field.handleChange(value)}
            onBlur={field.handleBlur}
            disabled={items.length === 0}
          />
        )}
      </form.Field>

      {embedMode === "embed" && !singleOutsetaEmbed && (
        <Button disabled={query.isPending || embedMutation.isPending}>
          Add Lead Capture Embed to page
        </Button>
      )}

      <PopupLinkFormSection popupUrl={leadCapturePopupUrl(config, domain)} />

      {domain && leadCaptures?.length === 0 && (
        <Alert level="warning">
          Add a{" "}
          <ExternalLink href={`https://${domain}/#/app/email/forms/`}>
            lead capture form in Outseta
          </ExternalLink>{" "}
          to start collecting leads.
        </Alert>
      )}
    </form>
  );
}
