import { createFileRoute, Outlet } from "@tanstack/react-router";
import { LinkList, LinkListItem, PageHeader } from "../common";
import { useConfiguration } from "../custom-code/CustomCodeProvider";
import { Separator } from "@triozer/framer-toolbox";
import { DisconnectedLinkListItem } from "../custom-code/DisconnectedLinkListItem";

export const Route = createFileRoute("/custom-code")({
  component: CustomCode,
});

function CustomCode() {
  const { domain } = useConfiguration();

  return (
    <>
      <PageHeader title="Custom Code" />

      <main>
        <Outlet />

        <Separator />

        <LinkList>
          {domain && (
            <LinkListItem
              title="View Outseta configurations"
              url={`https://${domain}/#/app/auth/sign-up-login`}
            />
          )}

          <LinkListItem
            title="Outseta Knowledge Base"
            url="https://go.outseta.com/support/kb/categories"
          />
        </LinkList>
      </main>
    </>
  );
}
