import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Separator } from "@triozer/framer-toolbox";
import { LinkList, LinkListItem, PageHeader } from "../common";
import { DisconnectedLinkListItem } from "../custom-code/DisconnectedLinkListItem";
import { useConfiguration } from "../custom-code";
import { GlobalErrorNotificationSection } from "../notifications";

export const Route = createFileRoute("/email-list")({
  component: EmailListPage,
});

function EmailListPage() {
  const { domain } = useConfiguration();

  return (
    <>
      <PageHeader title="Email Lists" />

      <main>
        <Outlet />

        <GlobalErrorNotificationSection />

        <Separator />

        <LinkList>
          <DisconnectedLinkListItem />

          {domain && (
            <LinkListItem
              title="Add or edit email lists"
              url={`https://${domain}/#/app/email/lists/`}
            />
          )}

          <LinkListItem
            title="Outseta Email Knowledge Base"
            url="https://go.outseta.com/support/kb/categories/Z496r9Xz/email"
          />
        </LinkList>
      </main>
    </>
  );
}
