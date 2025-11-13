import { useStore } from "@tanstack/react-form";
import { useFieldContext } from "./form-context.tsx";
import { ListControls } from "@triozer/framer-toolbox";
import FieldError from "./FieldError.tsx";

export default function SelectField({
  label,
  items,
}: {
  label: string;
  items: { label: string; value: string }[];
}) {
  const field = useFieldContext<string>();

  const errors = useStore(field.store, (state) => state.meta.errors);

  return (
    <>
      <ListControls
        title={label}
        items={items}
        value={field.state.value}
        onChange={(value) => field.handleChange(value)}
        onBlur={field.handleBlur}
      />
      <FieldError errors={errors} />
    </>
  );
}
