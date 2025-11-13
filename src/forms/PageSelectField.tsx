import { useStore } from "@tanstack/react-form";
import { useFieldContext } from "./form-context.tsx";
import FieldError from "./FieldError.tsx";
import { PageListControls } from "../common/PageListControls.tsx";

export default function PageSelectField({ label }: { label: string }) {
  const field = useFieldContext<string>();

  const errors = useStore(field.store, (state) => state.meta.errors);

  return (
    <>
      <PageListControls
        title={label}
        value={field.state.value}
        onChange={(value) => field.handleChange(value)}
        onBlur={field.handleBlur}
      />
      <FieldError errors={errors} />
    </>
  );
}
