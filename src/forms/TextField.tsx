import { useStore } from "@tanstack/react-form";
import { useFieldContext } from "./form-context.tsx";
import { TextControls } from "@triozer/framer-toolbox";
import FieldError from "./FieldError.tsx";

export default function TextField({
  label,
  placeholder,
}: {
  label: string;
  placeholder: string;
}) {
  const field = useFieldContext<string>();

  const errors = useStore(field.store, (state) => state.meta.errors);

  return (
    <>
      <TextControls
        title={label}
        placeholder={placeholder}
        value={field.state.value}
        onChange={(value) => field.handleChange(value)}
        onBlur={field.handleBlur}
      />
      <FieldError errors={errors} />
    </>
  );
}
