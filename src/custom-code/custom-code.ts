import { framer } from "framer-plugin";
import {
  generateScriptFromConfig,
  generateConfigFromRawHtml,
  scriptsMatch,
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
  callback: (props: {
    config: ScriptConfig;
    disabled: boolean;
    rawHtml: string;
    needsUpdate: boolean;
  }) => void,
) => {
  return framer.subscribeToCustomCode(({ headEnd }) => {
    const disabled = headEnd.disabled || false;
    const rawHtml = headEnd.html || "";
    const config = generateConfigFromRawHtml(rawHtml);
    const needsUpdate = !scriptsMatch(rawHtml, config);

    callback({
      config,
      disabled,
      rawHtml,
      needsUpdate,
    });
  });
};
