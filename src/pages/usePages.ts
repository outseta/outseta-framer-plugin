import { useQuery } from "@tanstack/react-query";
import { framer } from "framer-plugin";

export const usePageQuery = () => {
  const framerPageQuery = useQuery({
    queryKey: ["framer", "node", "WebPageNode"],
    queryFn: () => framer.getNodesWithType("WebPageNode"),
    refetchInterval: 700,
  });

  return framerPageQuery;
};
