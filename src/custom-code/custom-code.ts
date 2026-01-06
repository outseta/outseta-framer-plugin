import { framer } from "framer-plugin";
import {
  generateScriptFromConfig,
  generateConfigFromRawHtml,
  type ScriptConfig,
} from "../scripts";

export const setCustomCode = async (config: ScriptConfig) => {
  if (!config.domain) {
    return await framer.setCustomCode({ html: null, location: "headEnd" });
  } else {
    const script = generateScriptFromConfig(config);
    return await framer.setCustomCode({ html: script, location: "headEnd" });
  }
};

export const subscribeToCustomCode = (
  callback: (props: { config: ScriptConfig; disabled: boolean }) => void,
) => {
  return framer.subscribeToCustomCode(({ headEnd }) => {
    const disabled = headEnd.disabled || false;
    const config = generateConfigFromRawHtml(headEnd.html || "");

    callback({
      config,
      disabled,
    });
  });
};
