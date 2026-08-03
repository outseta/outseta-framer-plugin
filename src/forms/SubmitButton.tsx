import { Button } from "@triozer/framer-toolbox";
import { useFormContext } from "./form-context";

export default function SubmitButton({
  label,
  forceEnabled,
  disabled,
}: {
  label: string;
  forceEnabled?: boolean;
  disabled?: boolean;
}) {
  const form = useFormContext();
  return (
    <form.Subscribe selector={(state) => ({ isSubmitting: state.isSubmitting, isDirty: state.isDirty })}>
      {({ isSubmitting, isDirty }) => (
        <Button
          variant="primary"
          type="submit"
          disabled={disabled || (!isDirty && !forceEnabled) || isSubmitting}
        >
          {label}
        </Button>
      )}
    </form.Subscribe>
  );
}
