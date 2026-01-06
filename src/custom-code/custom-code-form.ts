import { formOptions, revalidateLogic } from "@tanstack/react-form";
import { z } from "zod";

import {
  DEFAULT_SCRIPT_CONFIG,
  scriptConfigSchema,
  type ScriptConfig,
} from "../scripts";

export { type ScriptConfig };

export type CustomCodeSchema = z.infer<typeof scriptConfigSchema>;

export const customCodeFormOptions = formOptions({
  defaultValues: DEFAULT_SCRIPT_CONFIG,
  validators: {
    onSubmit: scriptConfigSchema,
    onDynamic: scriptConfigSchema,
  },
  validationLogic: revalidateLogic({
    mode: "submit",
    modeAfterSubmission: "change",
  }),
});
