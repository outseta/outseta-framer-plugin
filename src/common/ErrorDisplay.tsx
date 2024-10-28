import { Button } from "@triozer/framer-toolbox";
import { PageHeader } from "./PageHeader";

export function ErrorDisplay(
  { error, resetError }: { error: Error | null; resetError: () => void }, // <-- specify the types for error and resetError
) {
  return (
    <>
      <PageHeader title="Error" />
      <main>
        <form>
          <p>Something went wrong</p>
          {error && <pre>{error?.message}</pre>}

          <Button onClick={resetError}>Try again</Button>
        </form>
      </main>
    </>
  );
}
