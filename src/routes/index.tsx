import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRightIcon,
  CodeIcon,
  EmailIcon,
  LinkList,
  LinkListItem,
  LockIcon,
  QuestionIcon,
  RefreshIcon,
  UserIcon,
} from "../common";

import classes from "./index.module.css";
import { CustomCodeSummary, useConfiguration } from "../custom-code";
import { useNotifications } from "../notifications";
import { Separator } from "@triozer/framer-toolbox";
import { DisconnectedLinkListItem } from "../custom-code/DisconnectedLinkListItem";

export const Route = createFileRoute("/")({
  component: IndexPage,
});

function IndexPage() {
  const notifications = useNotifications();

  return (
    <>
      <section className={classes.header}>
        <CustomCodeSummary />
      </section>
      <menu className={classes.menu}>
        {notifications.all.length > 0 && (
          <Link
            to="/notifications"
            className={`button ${classes.notifications}`}
          >
            <div>
              Attention needed{" "}
              {notifications.warnings.length === 1 && (
                <span>{notifications.warnings.length} warning</span>
              )}
              {notifications.warnings.length > 1 && (
                <span>{notifications.warnings.length} warnings</span>
              )}
              {notifications.errors.length === 1 && (
                <span>{notifications.errors.length} error</span>
              )}
              {notifications.errors.length > 1 && (
                <span>{notifications.errors.length} errors</span>
              )}
            </div>
            <ArrowRightIcon />
          </Link>
        )}
        <Link to="/auth" className="button">
          <CodeIcon />
          <span>Authentication</span>
          <ArrowRightIcon />
        </Link>
        <Link to="/user" className="button">
          <UserIcon />
          <span>User Profile & Data</span>
          <ArrowRightIcon />
        </Link>
        <Link to="/protected-content" className="button">
          <LockIcon />
          <span>Protect Content</span>
          <ArrowRightIcon />
        </Link>
        <Link to="/email-list" className="button">
          <EmailIcon />
          <span>Email lists</span>
          <ArrowRightIcon />
        </Link>
        <Link to="/lead-capture" className="button">
          <RefreshIcon />
          <span>Lead captures</span>
          <ArrowRightIcon />
        </Link>
        <Link to="/support" className="button">
          <QuestionIcon />
          <span>Support</span>
          <ArrowRightIcon />
        </Link>
      </menu>
      <Separator />

      <LinkList>
        <DisconnectedLinkListItem />

        <LinkListItem
          title="Outseta Knowledge Base"
          url="https://go.outseta.com/support/kb/categories"
        />
      </LinkList>
    </>
  );
}
