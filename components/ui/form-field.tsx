import type { ReactNode } from "react";
import { FieldError, Label } from "./field";

interface Props {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

/** Label + control + error, wired for screen readers via the `id`. */
export function FormField({ id, label, error, hint, children }: Props) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && !error && <p className="text-navy-400 mt-1 text-xs">{hint}</p>}
      <FieldError>{error}</FieldError>
    </div>
  );
}
