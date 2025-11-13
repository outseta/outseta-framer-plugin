import { formOptions, revalidateLogic } from "@tanstack/react-form";
import { z } from "zod";

import { defaultPostLoginConfig, postLoginSchema } from "./script-post-login";
import {
  defaultPostSignupConfig,
  postSignupSchema,
} from "./script-post-signup";
import {
  defaultTokenStorageConfig,
  tokenStorageSchema,
} from "./script-token-storage";

export const customCodeSchema = z
  .object({
    domain: z
      .hostname("An Outseta domain is required")
      .endsWith(".outseta.com", "An Outseta domain is required"),
  })
  .and(postLoginSchema)
  .and(postSignupSchema)
  .and(tokenStorageSchema);

export type CustomCodeSchema = z.infer<typeof customCodeSchema>;

const defaultValues = {
  domain: "",
  ...defaultTokenStorageConfig,
  ...defaultPostLoginConfig,
  ...defaultPostSignupConfig,
};

export const customCodeFormOptions = formOptions({
  defaultValues,
  validators: {
    onSubmit: customCodeSchema,
    onDynamic: customCodeSchema,
  },
  validationLogic: revalidateLogic({
    mode: "submit",
    modeAfterSubmission: "change",
  }),
});
