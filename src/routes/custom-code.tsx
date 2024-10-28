import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PageHeader } from "../common";

export const Route = createFileRoute("/custom-code")({
  component: () => (
    <>
      <PageHeader title="Custom Code" />

      <main>
        <Outlet />
      </main>
    </>
  ),
});
