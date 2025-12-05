import { Button } from "@triozer/framer-toolbox";
import { useFormContext } from "./form-context";

export default function SubmitButton({ label }: { label: string }) {
  const form = useFormContext();
  return (
    <form.Subscribe selector={(state) => ({ isSubmitting: state.isSubmitting, isDirty: state.isDirty })}>
      {({ isSubmitting, isDirty }) => (
        <Button variant="primary" type="submit" disabled={!isDirty || isSubmitting}>
          {label}
        </Button>
      )}
    </form.Subscribe>
  );
}
