import {
  createFileRoute,
  Outlet,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { LinkList, LinkListItem, PageHeader } from "../common";
import { SegmentedControls, Separator } from "@triozer/framer-toolbox";
import { DisconnectedLinkListItem, useConfiguration } from "../custom-code";
import { GlobalErrorNotificationSection } from "../notifications";

export const Route = createFileRoute("/protected-content")({
  component: ProtectedContentPage,
});

function ProtectedContentPage() {
  const pathname = useLocation({
    select: (location) => location.pathname,
  });

  const navigate = useNavigate();

  const { domain } = useConfiguration();

  return (
    <>
      <PageHeader title="Protected Content" />

      <section>
        <SegmentedControls
          items={[
            { value: "/protected-content", label: "Pages" },
            { value: "/protected-content/overrides", label: "Code Overrides" },
          ]}
          value={pathname}
          onChange={(value) => navigate({ to: value })}
        />
      </section>

      <main>
        <Outlet />

        <GlobalErrorNotificationSection />

        <Separator />

        <LinkList>
          <DisconnectedLinkListItem />

          {domain && (
            <LinkListItem
              title="View, edit or add protected content groups"
              url={`https://${domain}/#/app/auth/nocode/content-groups`}
            />
          )}

          <LinkListItem
            title="Outseta Protected Content Knowledge Base"
            url="https://go.outseta.com/support/kb/categories/rQVZLeQ6/protected-content"
          />
        </LinkList>
      </main>
    </>
  );
}
