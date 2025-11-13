import { useMutation } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { SwitchIcon } from "../common";
import classes from "./CustomCodeSummary.module.css";

import { setCustomCode } from "./custom-code";
import { useCustomCode } from "./CustomCodeProvider";
import { defaultTokenStorageConfig } from "./script-token-storage";

export function CustomCodeSummary() {
  const { domain, status } = useCustomCode();

  const disconnectMutation = useMutation({
    mutationFn: () =>
      setCustomCode({
        domain: "",
        postLoginConfig: { postLoginMode: "default" },
        postSignupConfig: { postSignupMode: "default" },
        tokenStorageConfig: defaultTokenStorageConfig,
      }),
  });

  if (status === "disconnected") {
    return (
      <header className={classes.root}>
        <p>Connect to your Outseta account</p>
        <menu>
          <Link to="/custom-code" className="button">
            <SwitchIcon />
            <span>Add account</span>
          </Link>
        </menu>
      </header>
    );
  } else {
    return (
      <header className={classes.root}>
        <p>
          <strong>{domain}</strong>
          <span> · </span>
          <button
            type="button"
            className={classes.disconnectButton}
            onClick={() => disconnectMutation.mutate()}
          >
            disconnect
          </button>
          <span> · </span>
          <Link to="/custom-code">edit</Link>
        </p>
      </header>
    );
  }
}
