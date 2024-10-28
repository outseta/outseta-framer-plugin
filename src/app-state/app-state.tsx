import {
  CanvasNode,
  CanvasRootNode,
  ComponentInstanceNode,
  framer,
  isComponentInstanceNode,
  supportsLink,
} from "framer-plugin";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

type AppState = {
  embedMode: "embed" | "popup";
  rootNodes: CanvasNode[];
  selection: CanvasNode[];
};

interface AppStateContextType {
  state: AppState;
  setState: (state: AppState) => void;
}

const initialState: AppState = {
  embedMode: "embed",
  rootNodes: [],
  selection: [],
};

const AppStateContext = createContext<AppStateContextType>({
  state: initialState,
  setState: () => {},
});

export const AppStateProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AppState>(initialState);

  useEffect(() => {
    const setRoot = async (root: CanvasRootNode) => {
      const children = await root.getChildren();
      setState((state) => ({ ...state, rootNodes: children }));
    };
    return framer.subscribeToCanvasRoot(setRoot);
  }, []);

  useEffect(() => {
    return framer.subscribeToSelection((selection) => {
      setState((state) => ({ ...state, selection }));
    });
  }, []);

  return (
    <AppStateContext.Provider value={{ state, setState }}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = (): AppStateContextType => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }
  return context;
};

export const useEmbedMode = () => {
  const { state, setState } = useAppState();
  return {
    embedMode: state.embedMode,
    setEmbedMode: (embedMode: AppState["embedMode"]) =>
      setState({ ...state, embedMode }),
  };
};

export const useSingleOutsetaEmbedSelection = () => {
  const { state } = useAppState();

  const embedSelection = state.selection
    .filter((node) => {
      return isComponentInstanceNode(node);
    })
    .filter((node) => {
      return node.componentName === "OutsetaEmbed";
    });

  const selectedRootNodes = state.rootNodes.filter((node) => {
    return node.id === embedSelection?.[0]?.id;
  });

  if (embedSelection.length === 1) {
    return (selectedRootNodes[0] as ComponentInstanceNode) || embedSelection[0];
  } else {
    return null;
  }
};

export const useSingleSupportsLinkSelection = () => {
  const { state } = useAppState();

  const supportsLinkSelection = state.selection.filter((node) => {
    return supportsLink(node);
  });

  if (supportsLinkSelection.length === 1) {
    return supportsLinkSelection[0];
  } else {
    return null;
  }
};
