import {
  createFileRoute,
  Outlet,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { SegmentedControls, Separator } from "@triozer/framer-toolbox";

import { LinkList, LinkListItem, PageHeader } from "../common";
import { DisconnectedLinkListItem, useConfiguration } from "../custom-code";
import { GlobalErrorNotificationSection } from "../notifications";

export const Route = createFileRoute("/user")({
  component: Auth,
});

function Auth() {
  const pathname = useLocation({
    select: (location) => location.pathname,
  });

  const navigate = useNavigate();
  const { domain } = useConfiguration();

  return (
    <>
      <PageHeader title="User Profile & Data" />

      <section>
        <SegmentedControls
          items={[
            { value: "/user", label: "Profile" },
            { value: "/user/overrides", label: "Code Overrides" },
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
              title="Configure the profile fields"
              url={`https://${domain}/#/app/auth/nocode/profile-tabs`}
            />
          )}

          {domain && (
            <LinkListItem
              title="Change the embed design to match your site"
              url={`https://${domain}#/app/auth/embeds/design`}
            />
          )}
        </LinkList>
      </main>
    </>
  );
}
