import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Separator } from "@triozer/framer-toolbox";
import { LinkList, LinkListItem, PageHeader } from "../common";
import { DisconnectedLinkListItem, useConfiguration } from "../custom-code";
import { GlobalErrorNotificationSection } from "../notifications";

export const Route = createFileRoute("/support")({
  component: SupportPage,
});

function SupportPage() {
  const { domain } = useConfiguration();
  return (
    <>
      <PageHeader title="Support" />

      <main>
        <Outlet />

        <GlobalErrorNotificationSection />

        <Separator />

        <LinkList>
          <DisconnectedLinkListItem />

          {domain && (
            <LinkListItem
              title="View or edit support settings"
              url={`https://${domain}/#/app/support/settings/general`}
            />
          )}

          <LinkListItem
            title="Outseta Support Knowledge Base"
            url="https://go.outseta.com/support/kb/categories/By9q8QAP/help-desk"
          />
        </LinkList>
      </main>
    </>
  );
}
