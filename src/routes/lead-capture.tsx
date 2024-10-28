import { createFileRoute, Outlet } from "@tanstack/react-router";

import { LinkList, LinkListItem, PageHeader } from "../common";
import { Separator } from "@triozer/framer-toolbox";
import { DisconnectedLinkListItem, useConfiguration } from "../custom-code";
import { GlobalErrorNotificationSection } from "../notifications";

export const Route = createFileRoute("/lead-capture")({
  component: LeadCapture,
});

function LeadCapture() {
  const { domain } = useConfiguration();
  return (
    <>
      <PageHeader title="Lead Capture" />

      <main>
        <Outlet />

        <GlobalErrorNotificationSection />

        <Separator />

        <LinkList>
          <DisconnectedLinkListItem />

          {domain && (
            <LinkListItem
              title="View, edit or add lead capture forms"
              url={`https://${domain}/#/app/email/forms/`}
            />
          )}

          <LinkListItem
            title="Outseta Lead Capture Knowledge Base"
            url="https://go.outseta.com/support/kb/categories/Z496r9Xz/email"
          />
        </LinkList>
      </main>
    </>
  );
}
