import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { subscribeToCustomCode } from "./custom-code";

import {
  type TokenStorageConfig,
  defaultTokenStorageConfig,
} from "./script-token-storage";
import {
  type PostLoginConfig,
  defaultPostLoginConfig,
} from "./script-post-login";
import {
  type PostSignupConfig,
  defaultPostSignupConfig,
} from "./script-post-signup";

import { useQuery } from "@tanstack/react-query";
import { getPlanData } from "../outseta";

type CustomCodeState = {
  status: "loading" | "connected" | "disconnected";
  domain: string;
  tokenStorageConfig: TokenStorageConfig;
  postLoginConfig: PostLoginConfig;
  postSignupConfig: PostSignupConfig;
  disabled: boolean;
};

const CustomCodeContext = createContext<CustomCodeState | undefined>(undefined);

const initialState: CustomCodeState = {
  status: "loading",
  domain: "",
  tokenStorageConfig: defaultTokenStorageConfig,
  postLoginConfig: defaultPostLoginConfig,
  postSignupConfig: defaultPostSignupConfig,
  disabled: false,
};

export const CustomCodeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    subscribeToCustomCode((customCode) => {
      setState({
        status: customCode.domain ? "connected" : "disconnected",
        domain: customCode.domain ?? initialState.domain,
        postLoginConfig:
          customCode.postLoginConfig ?? initialState.postLoginConfig,
        postSignupConfig:
          customCode.postSignupConfig ?? initialState.postSignupConfig,
        tokenStorageConfig:
          customCode.tokenStorageConfig ?? initialState.tokenStorageConfig,
        disabled: customCode.disabled ?? initialState.disabled,
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
    throw new Error("useAppState must be used within an AppStateProvider");
  }
  return context;
};

export const useConfiguration = () => {
  const { domain, disabled } = useCustomCode();
  const query = useQuery({
    queryKey: ["outseta", "validate", domain],
    queryFn: () => getPlanData(domain),
    enabled: !!domain,
    retry: 1,
  });
  const isInvalid = !query.data && query.errorUpdatedAt > 0;
  return { domain, isInvalid, disabled };
};
