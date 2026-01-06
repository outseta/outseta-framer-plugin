import { Button } from "@triozer/framer-toolbox";
import { useFormContext } from "./form-context";

export default function SubmitButton({
  label,
  forceEnabled,
}: {
  label: string;
  forceEnabled?: boolean;
}) {
  const form = useFormContext();
  return (
    <form.Subscribe selector={(state) => ({ isSubmitting: state.isSubmitting, isDirty: state.isDirty })}>
      {({ isSubmitting, isDirty }) => (
        <Button
          variant="primary"
          type="submit"
          disabled={(!isDirty && !forceEnabled) || isSubmitting}
        >
          {label}
        </Button>
      )}
    </form.Subscribe>
  );
}
