import { formOptions, revalidateLogic } from "@tanstack/react-form";
import { z } from "zod";

import {
  defaultTokenStorageConfig,
  tokenStorageSchema,
} from "./script-token-storage";
import { defaultPostLoginConfig, postLoginSchema } from "./script-post-login";
import {
  defaultPostSignupConfig,
  postSignupSchema,
} from "./script-post-signup";
import {
  defaultSignupConfirmationConfig,
  signupConfirmationSchema,
} from "./script-signup-confirmation";

export const customCodeSchema = z
  .object({
    domain: z
      .hostname("An Outseta domain is required")
      .endsWith(".outseta.com", "An Outseta domain is required"),
  })
  .and(tokenStorageSchema)
  .and(postLoginSchema)
  .and(postSignupSchema)
  .and(signupConfirmationSchema);

export type CustomCodeSchema = z.infer<typeof customCodeSchema>;

const defaultValues = {
  domain: "",
  ...defaultTokenStorageConfig,
  ...defaultPostLoginConfig,
  ...defaultPostSignupConfig,
  ...defaultSignupConfirmationConfig,
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
