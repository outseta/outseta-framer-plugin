import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { framer } from "framer-plugin";

const PAGE_POLL_INTERVAL_MS = 30_000;

const canRefreshPages = () =>
  document.visibilityState === "visible" && document.hasFocus();

export const usePageQuery = () => {
  const [isActive, setIsActive] = useState(canRefreshPages);
  const framerPageQuery = useQuery({
    queryKey: ["framer", "node", "WebPageNode"],
    queryFn: () => framer.getNodesWithType("WebPageNode"),
    refetchInterval: isActive ? PAGE_POLL_INTERVAL_MS : false,
  });

  const { refetch } = framerPageQuery;

  useEffect(() => {
    const refreshWhenActive = () => {
      if (canRefreshPages()) void refetch();
    };

    const updateActiveState = () => {
      const active = canRefreshPages();
      setIsActive(active);
      if (active) void refetch();
    };

    const unsubscribeFromCanvasRoot =
      framer.subscribeToCanvasRoot(refreshWhenActive);
    window.addEventListener("focus", updateActiveState);
    window.addEventListener("blur", updateActiveState);
    document.addEventListener("visibilitychange", updateActiveState);

    return () => {
      unsubscribeFromCanvasRoot();
      window.removeEventListener("focus", updateActiveState);
      window.removeEventListener("blur", updateActiveState);
      document.removeEventListener("visibilitychange", updateActiveState);
    };
  }, [refetch]);

  return framerPageQuery;
};
