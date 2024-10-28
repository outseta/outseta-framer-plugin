import { useMutation } from "@tanstack/react-query";
import { Button } from "@triozer/framer-toolbox";
import { useState } from "react";

export const copyToClipboard = (text: string) => {
  return navigator.clipboard.writeText(text);
};

export function CopyButton({
  label,
  text,
  disabled,
}: {
  label: string;
  text: string;
  disabled?: boolean;
}) {
  const [message, setMessage] = useState("");
  const mutation = useMutation({
    mutationFn: () => copyToClipboard(text),
    onSuccess: () => {
      // Set the temporary message when mutation succeeds
      setMessage("Copied!");

      // Reset the message after 3 seconds
      setTimeout(() => {
        setMessage("");
      }, 1000);
    },
    onError: () => {},
  });

  return (
    <>
      <Button
        variant="primary"
        onClick={(event) => {
          event.preventDefault();
          mutation.mutate();
        }}
        disabled={disabled}
      >
        {message || label}
      </Button>
    </>
  );
}
