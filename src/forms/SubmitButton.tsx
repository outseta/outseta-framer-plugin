import { Button } from "@triozer/framer-toolbox";
import { useFormContext } from "./form-context";

export default function SubmitButton({ label }: { label: string }) {
  const form = useFormContext();
  return (
    <form.Subscribe selector={(state: any) => state.isSubmitting}>
      {(isSubmitting: boolean) => (
        <Button variant="primary" type="submit" disabled={isSubmitting}>
          {label}
        </Button>
      )}
    </form.Subscribe>
  );
}
