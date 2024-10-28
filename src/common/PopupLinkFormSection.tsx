import { Button } from "@triozer/framer-toolbox";
import { useSingleSupportsLinkSelection } from "../app-state";
import { useMutation } from "@tanstack/react-query";
import { CopyButton } from "./CopyButton";
import { Link } from "@tanstack/react-router";

export function PopupLinkFormSection({ popupUrl }: { popupUrl: string }) {
  const singleSupportsLinkNode = useSingleSupportsLinkSelection();

  const mutation = useMutation({
    mutationFn: () => {
      if (!singleSupportsLinkNode) return Promise.resolve(null);
      return singleSupportsLinkNode.setAttributes({
        link: popupUrl,
        linkOpenInNewTab: false,
      });
    },
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
          disabled={!popupUrl}
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

      {!popupUrl && (
        <p>
          Connect to an <Link to="/custom-code">Outseta domain</Link> to enable
          popup links.
        </p>
      )}
    </>
  );
}
