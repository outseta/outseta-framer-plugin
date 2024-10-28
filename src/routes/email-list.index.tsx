import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, ListControls } from "@triozer/framer-toolbox";

import { useConfiguration } from "../custom-code";
import {
  upsertEmailListEmbed,
  EmailListEmbedConfig,
  emailListPopupUrl,
  getEmailListData,
} from "../outseta";

import { EmbedModeListControls, Alert, CopyButton } from "../common";
import {
  useEmbedMode,
  useSingleOutsetaEmbedSelection,
  useSingleSupportsLinkSelection,
} from "../app-state";

export const Route = createFileRoute("/email-list/")({
  component: EmailListIndex,
});

export function EmailListIndex() {
  const { embedMode } = useEmbedMode();
  const { domain, isInvalid } = useConfiguration();
  const singleSupportsLink = useSingleSupportsLinkSelection();
  const singleOutsetaEmbed = useSingleOutsetaEmbedSelection();

  const query = useQuery({
    queryKey: ["outseta", "email-list", "all", domain],
    queryFn: () => getEmailListData(domain),
    enabled: !!domain && !isInvalid,
  });

  const [uid, setUid] = useState<string | undefined>(undefined);

  const emailLists = query.data?.items;
  const defaultUid = emailLists?.[0]?.Uid;
  const disablePopup = !defaultUid;

  const config: EmailListEmbedConfig = { uid: uid || defaultUid || "" };

  useEffect(() => {
    const uid = singleOutsetaEmbed?.controls.emailListUid as string;
    setUid(uid);
  }, [singleOutsetaEmbed?.controls.emailListUid]);

  const embedMutation = useMutation({
    mutationFn: () => upsertEmailListEmbed(config, singleOutsetaEmbed),
  });

  const popupMutation = useMutation({
    mutationFn: () => {
      if (!singleSupportsLink) return Promise.resolve(null);
      return singleSupportsLink.setAttributes({
        link: emailListPopupUrl(config, domain),
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
        title="Email List"
        items={items}
        value={uid === undefined ? defaultUid : uid}
        onChange={(value) => setUid(value)}
        disabled={items.length === 0}
      />

      {embedMode === "embed" && !singleOutsetaEmbed && (
        <Button variant="primary">Add Email List Embed to page</Button>
      )}

      {embedMode === "popup" && singleSupportsLink && (
        <Button variant="primary" disabled={disablePopup}>
          Set Email List Popup Link
        </Button>
      )}

      {embedMode === "popup" && !singleSupportsLink && (
        <>
          <CopyButton
            label={`Copy Popup Url to clipboard`}
            text={emailListPopupUrl(config, domain)}
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

      {domain && emailLists?.length === 0 && (
        <Alert level="warning">
          Add an{" "}
          <a href={`https://${domain}/#/app/email/lists/`} target="_blank">
            email list in Outseta
          </a>{" "}
          to start collecting emails.
        </Alert>
      )}
    </form>
  );
}
