import { Button } from "@triozer/framer-toolbox";
import { useSingleSupportsLinkSelection } from "../app-state";
import { useMutation } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { framer, useIsAllowedTo } from "framer-plugin";
import { CopyButton } from "./CopyButton";
import { PermissionNotice } from "./PermissionNotice";
import {
  notifyMutationError,
  requireFramerPermission,
} from "../framer/permissions";

export function PopupLinkFormSection({ popupUrl }: { popupUrl: string }) {
  const singleSupportsLinkNode = useSingleSupportsLinkSelection();
  const canSetAttributes = useIsAllowedTo("Node.setAttributes");

  const mutation = useMutation({
    mutationFn: () => {
      if (!singleSupportsLinkNode) return Promise.resolve(null);
      requireFramerPermission("Node.setAttributes", "assign popup links");
      return singleSupportsLinkNode.setAttributes({
        link: popupUrl,
        linkOpenInNewTab: false,
      });
    },
    onSuccess: () => {
      framer.notify("Popup link assigned", { variant: "success" });
    },
    onError: notifyMutationError("assign the popup link"),
    throwOnError: false,
  });

  return (
    <>
      {singleSupportsLinkNode ? (
        <Button
          variant="primary"
          onClick={(event) => {
            event.preventDefault();
            mutation.mutate();
          }}
          disabled={!popupUrl || !canSetAttributes || mutation.isPending}
        >
          Assign popup url as the <strong>Link To</strong> value
        </Button>
      ) : (
        <>
          <CopyButton
            label={`Copy popup url to clipboard`}
            text={popupUrl}
            disabled={!popupUrl}
          />

          {popupUrl && (
            <p>
              Paste the copied url as the <strong>Link To</strong> value
              <br /> and set <strong>New Tab</strong> to <em>No</em>.
            </p>
          )}
        </>
      )}

      {singleSupportsLinkNode && !canSetAttributes && (
        <PermissionNotice action="assign popup links" />
      )}

      {!popupUrl && (
        <p>
          Connect to an <Link to="/custom-code">Outseta domain</Link> to enable
          popup links.
        </p>
      )}
    </>
  );
}
