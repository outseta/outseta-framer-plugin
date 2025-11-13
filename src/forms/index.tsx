import { createFormHook } from "@tanstack/react-form";
import { fieldContext, formContext } from "./form-context.tsx";
import TextField from "./TextField.tsx";
import SubmitButton from "./SubmitButton.tsx";
import SelectField from "./SelectField.tsx";
import PageSelectField from "./PageSelectField.tsx";

export const { useAppForm, withForm, withFieldGroup } = createFormHook({
  fieldComponents: {
    TextField,
    SelectField,
    PageSelectField,
  },
  formComponents: {
    SubmitButton,
  },
  fieldContext,
  formContext,
});
