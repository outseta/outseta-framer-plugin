import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { type ScriptConfig, DEFAULT_SCRIPT_CONFIG } from "../scripts";
import { subscribeToCustomCode } from "./custom-code";

import { useQuery } from "@tanstack/react-query";
import { getPlanData } from "../outseta";

type CustomCodeState = {
  status: "loading" | "connected" | "disconnected";
  config: ScriptConfig;
  disabled: boolean;
  needsUpdate: boolean;
};

const CustomCodeContext = createContext<CustomCodeState | undefined>(undefined);

const initialState: CustomCodeState = {
  status: "loading",
  config: DEFAULT_SCRIPT_CONFIG,
  disabled: false,
  needsUpdate: false,
};

export const CustomCodeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    subscribeToCustomCode((customCode) => {
      setState({
        status: customCode.config.domain ? "connected" : "disconnected",
        config: customCode.config ?? initialState.config,
        disabled: customCode.disabled ?? initialState.disabled,
        needsUpdate: customCode.needsUpdate ?? initialState.needsUpdate,
      });
    });
  }, []);

  return (
    <CustomCodeContext.Provider value={state}>
      {children}
    </CustomCodeContext.Provider>
  );
};

export const useCustomCode = (): CustomCodeState => {
  const context = useContext(CustomCodeContext);
  if (!context) {
    throw new Error("useCustomCode must be used within a CustomCodeProvider");
  }
  return context;
};

export const useConfiguration = () => {
  const {
    config: { domain },
    disabled,
  } = useCustomCode();

  const query = useQuery({
    queryKey: ["outseta", "validate", domain],
    queryFn: () => getPlanData(domain),
    enabled: !!domain,
    retry: 1,
  });

  const isInvalid = !query.data && query.errorUpdatedAt > 0;
  return { domain, isInvalid, disabled };
};
