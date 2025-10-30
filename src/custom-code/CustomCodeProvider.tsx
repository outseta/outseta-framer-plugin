import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { subscribeToCustomCode } from "./custom-code";
import type { AuthCallbackConfig } from "./script-auth-callback";
import type { PostSignupConfig } from "./script-post-signup";
import { useQuery } from "@tanstack/react-query";
import { getPlanData } from "../outseta";

type CustomCodeState = {
  status: "loading" | "connected" | "disconnected";
  domain: string;
  authCallbackConfig: AuthCallbackConfig;
  postSignupConfig: PostSignupConfig;
  disabled: boolean;
};

const CustomCodeContext = createContext<CustomCodeState | undefined>(undefined);

const initialState: CustomCodeState = {
  status: "loading",
  domain: "",
  authCallbackConfig: { mode: "default" },
  postSignupConfig: { mode: "default" },
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
        domain: customCode.domain ?? "",
        authCallbackConfig: customCode.authCallbackConfig ?? {
          mode: "default",
        },
        postSignupConfig: customCode.postSignupConfig ?? { mode: "default" },
        disabled: customCode.disabled ?? false,
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
