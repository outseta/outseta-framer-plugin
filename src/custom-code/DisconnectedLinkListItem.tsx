import { Link } from "@tanstack/react-router";
import { LinkListItem } from "../common";
import { useConfiguration } from "./CustomCodeProvider";

export function DisconnectedLinkListItem() {
  const { domain } = useConfiguration();
  if (domain) return null;

  return (
    <LinkListItem
      title="Create an Outseta account"
      subtitle={
        <>
          or connect to your <Link to="/custom-code">existing account</Link> to
          get started
        </>
      }
      url="https://outseta.com"
    />
  );
}
