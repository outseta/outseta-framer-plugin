export default function FieldErrors({ errors }: { errors: string[] }) {
  if (errors.length === 0) return null;
  const error = errors[0];
  return (
    <p className="error">
      {typeof error === "string" && error}
      {typeof error !== "string" &&
        ((error as { message?: string })?.message || "Invalid value")}
    </p>
  );
}
