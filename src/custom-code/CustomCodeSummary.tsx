import { useMutation } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { SwitchIcon } from "../common";
import classes from "./CustomCodeSummary.module.css";

import { setCustomCode } from "./custom-code";
import { useCustomCode } from "./CustomCodeProvider";
import { DEFAULT_SCRIPT_CONFIG } from "../scripts";

export function CustomCodeSummary() {
  const { config, status } = useCustomCode();

  const disconnectMutation = useMutation({
    mutationFn: () => setCustomCode(DEFAULT_SCRIPT_CONFIG),
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
