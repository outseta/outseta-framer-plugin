import { createRootRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

import { useEmbedMode, useSingleOutsetaEmbedSelection } from "../app-state";
import { Widget, WidgetMode } from "../outseta";

import classes from "./__root.module.css";
import { useEffect } from "react";

export const Route = createRootRoute({
  component: Root,
});

function Root() {
  const navigate = useNavigate();
  const { setEmbedMode } = useEmbedMode();
  const singleOutsetaEmbed = useSingleOutsetaEmbedSelection();

  useEffect(() => {
    if (!singleOutsetaEmbed) return;

    setEmbedMode("embed");

    const embedControls = singleOutsetaEmbed?.controls;
    const { widget, widgetMode } = embedControls as {
      widget: Widget;
      widgetMode: WidgetMode;
    };

    if (widget === "auth" && widgetMode === "register") {
      navigate({ to: "/auth", from: "/" });
    } else if (widget === "auth" && widgetMode === "login") {
      navigate({ to: "/auth/login", from: "/" });
    } else if (widget === "profile") {
      navigate({ to: "/user", from: "/" });
    } else if (widget === "emailList") {
      navigate({ to: "/email-list", from: "/" });
    } else if (widget === "leadCapture") {
      navigate({ to: "/lead-capture", from: "/" });
    } else if (widget === "support") {
      navigate({ to: "/support", from: "/" });
    }
  }, [singleOutsetaEmbed]);

  return (
    <div className={classes.root}>
      <Outlet />
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </div>
  );
}
