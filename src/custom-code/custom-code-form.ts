import { formOptions, revalidateLogic } from "@tanstack/react-form";
import { z } from "zod";

import { defaultTokenStorageConfig, tokenStorageSchema } from "../scripts/token-storage";
import { defaultPostLoginConfig, postLoginSchema } from "../scripts/post-login";
import { defaultPostSignupConfig, postSignupSchema } from "../scripts/post-signup";
import {
  defaultSignupConfirmationConfig,
  signupConfirmationSchema,
} from "../scripts/signup-confirmation";

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
