import { useMutation } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useIsAllowedTo } from "framer-plugin";
import { SwitchIcon } from "../common";
import classes from "./CustomCodeSummary.module.css";

import { setCustomCode } from "./custom-code";
import { useCustomCode } from "./CustomCodeProvider";
import { DEFAULT_SCRIPT_CONFIG } from "../scripts";
import { notifyMutationError } from "../framer/permissions";

export function CustomCodeSummary() {
  const { config, status } = useCustomCode();
  const canSetCustomCode = useIsAllowedTo("setCustomCode");

  const disconnectMutation = useMutation({
    mutationFn: () => setCustomCode(DEFAULT_SCRIPT_CONFIG),
    onError: notifyMutationError("disconnect the Outseta account"),
    throwOnError: false,
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
          <strong>{config.domain}</strong>
          <span> · </span>
          <button
            type="button"
            className={classes.disconnectButton}
            onClick={() => disconnectMutation.mutate()}
            disabled={!canSetCustomCode || disconnectMutation.isPending}
            title={
              canSetCustomCode
                ? undefined
                : "You don't have permission to change custom code"
            }
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
