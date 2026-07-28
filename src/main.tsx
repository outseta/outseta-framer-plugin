import "./framer-globals.css";
import "@triozer/framer-toolbox/index.css";

import * as React from "react";
import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { FormDevtoolsPlugin } from "@tanstack/react-form-devtools";
import Rollbar from "rollbar";
import {
  Provider as RollbarProvider,
  ErrorBoundary as RollbarErrorBoundary,
} from "@rollbar/react";
import { framer } from "framer-plugin";
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { AppStateProvider } from "./app-state";
import { CustomCodeProvider } from "./custom-code";

/**
 * ROLLBAR
 */

const rollbarAccessToken = import.meta.env.VITE_ROLLBAR_ACCESS_TOKEN;
const rollbar = rollbarAccessToken
  ? new Rollbar({
      accessToken: rollbarAccessToken,
      environment: import.meta.env.MODE,
      captureUncaught: true,
      captureUnhandledRejections: true,
    })
  : null;

/**
 * TANSTACK ROUTER
 */

// Import the generated route tree
import { routeTree } from "./routeTree.gen";
import { ErrorDisplay } from "./common";

// Error component for router
const RouterErrorComponent = ({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) => {
  useEffect(() => {
    if (error) {
      console.error("Tanstack Router", error);
      rollbar?.error(error);
    }
  }, [error]);
  return <ErrorDisplay error={error} resetError={reset} />;
};

// Create a new router instance
const router = createRouter({
  routeTree,
  defaultErrorComponent: RouterErrorComponent,
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

/**
 * TANSTACK QUERY
 */

// Create a client
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      console.error("Tanstack Query", error);
      rollbar?.error(error);
    },
  }),
});

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

/**
 * FRAMER
 */

// Show the Framer UI
framer.showUI({
  width: 400,
});

const app = (
  <QueryClientProvider client={queryClient}>
    <AppStateProvider>
      <CustomCodeProvider>
        <RouterProvider router={router} />
      </CustomCodeProvider>
    </AppStateProvider>
  </QueryClientProvider>
);

createRoot(root).render(
  <React.StrictMode>
    {rollbar ? (
      <RollbarProvider instance={rollbar}>
        <RollbarErrorBoundary fallbackUI={ErrorDisplay}>
          {app}
        </RollbarErrorBoundary>
      </RollbarProvider>
    ) : (
      app
    )}

    <TanStackDevtools
      config={{ hideUntilHover: true }}
      plugins={[FormDevtoolsPlugin()]}
    />
  </React.StrictMode>,
);
