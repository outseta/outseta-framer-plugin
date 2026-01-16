import { useEffect, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, ListControls } from "@triozer/framer-toolbox";
import { revalidateLogic, useForm } from "@tanstack/react-form";
import { z } from "zod";

import { useConfiguration } from "../custom-code";
import {
  upsertEmailListEmbed,
  EmailListEmbedConfig,
  emailListPopupUrl,
  getEmailListData,
} from "../outseta";

import {
  EmbedModeListControls,
  Alert,
  PopupLinkFormSection,
  ExternalLink,
} from "../common";
import { useEmbedMode, useSingleOutsetaEmbedSelection } from "../app-state";

export const Route = createFileRoute("/email-list/")({
  component: EmailListIndex,
});

export function EmailListIndex() {
  const { embedMode } = useEmbedMode();
  const { domain, isInvalid } = useConfiguration();
  const singleOutsetaEmbed = useSingleOutsetaEmbedSelection();

  const query = useQuery({
    queryKey: ["outseta", "email-list", "all", domain],
    queryFn: () => getEmailListData(domain),
    enabled: !!domain && !isInvalid,
  });

  const emailLists = query.data?.items;
  const defaultUid = emailLists?.[0]?.Uid;

  const currentUid = singleOutsetaEmbed?.controls.emailListUid as
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
      // When lists exist, require a non-empty uid
      onSubmit: z.object({ uid: z.string().trim() }).optional(),
    },
    onSubmit: async ({ value }) => {
      const cfg: EmailListEmbedConfig = { uid: value.uid };
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
    // Only update if different to avoid extra renders
    if (form.state.values.uid !== next) {
      form.setFieldValue("uid", next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUid, defaultUid]);

  const config: EmailListEmbedConfig = {
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
    mutationFn: () => upsertEmailListEmbed(config, singleOutsetaEmbed),
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
            title="Email List"
            items={items}
            value={(field.state.value as string | undefined) ?? defaultUid}
            onChange={(value) => field.handleChange(value)}
            onBlur={field.handleBlur}
            disabled={items.length === 0}
          />
        )}
      </form.Field>

      {embedMode === "embed" && !singleOutsetaEmbed && (
        <Button variant="primary" disabled={query.isPending || embedMutation.isPending}>
          Add Email List Embed to page
        </Button>
      )}

      <PopupLinkFormSection popupUrl={emailListPopupUrl(config, domain)} />

      {domain && emailLists?.length === 0 && (
        <Alert level="warning">
          Add an{" "}
          <ExternalLink href={`https://${domain}/#/app/email/lists/`}>
            email list in Outseta
          </ExternalLink>{" "}
          to start collecting emails.
        </Alert>
      )}
    </form>
  );
}
