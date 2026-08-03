import {
  createFileRoute,
  Outlet,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { SegmentedControls, Separator } from "@triozer/framer-toolbox";

import { LinkList, LinkListItem, PageHeader } from "../common";
import { useConfiguration, DisconnectedLinkListItem } from "../custom-code";
import { useSingleOutsetaEmbedSelection } from "../app-state";
import { upsertAuthEmbed, useCanUpsertEmbed } from "../outseta";
import { useMutation } from "@tanstack/react-query";
import { notifyMutationError } from "../framer/permissions";
import { GlobalErrorNotificationSection } from "../notifications";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const pathname = useLocation({
    select: (location) => location.pathname,
  });

  const navigate = useNavigate();
  const { domain } = useConfiguration();
  const singleOutsetaEmbed = useSingleOutsetaEmbedSelection();
  const canUpdateEmbed = useCanUpsertEmbed(singleOutsetaEmbed);

  const updateEmbedMutation = useMutation({
    mutationFn: (widgetMode: "register" | "login") =>
      upsertAuthEmbed({ widgetMode }, singleOutsetaEmbed),
    onError: notifyMutationError("change the authentication embed"),
    throwOnError: false,
  });

  return (
    <>
      <PageHeader title="Authentication" />

      <section>
        <SegmentedControls
          items={[
            { value: "/auth", label: "Signup" },
            { value: "/auth/login", label: "Login" },
            { value: "/auth/logout", label: "Logout" },
          ]}
          value={pathname}
          disabled={!!singleOutsetaEmbed && !canUpdateEmbed}
          onChange={(value) => {
            if (singleOutsetaEmbed && value === "/auth") {
              updateEmbedMutation.mutate("register");
            } else if (singleOutsetaEmbed && value === "/auth/login") {
              updateEmbedMutation.mutate("login");
            } else {
              navigate({ to: value });
            }
          }}
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
              title="Add or edit plans and plan families"
              url={`https://${domain}/#/app/billing/plans/`}
            />
          )}

          {domain && (
            <LinkListItem
              title="Change the embed design to match your site"
              url={`https://${domain}#/app/auth/embeds/design`}
            />
          )}

          <LinkListItem
            title="Outseta Auth Knowledge Base"
            url="https://go.outseta.com/support/kb/categories/xE9LyAWw/sign-up-and-login"
          />
        </LinkList>
      </main>
    </>
  );
}
