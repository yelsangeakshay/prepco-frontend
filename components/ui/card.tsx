import * as React from "react";
import { cn } from "@/lib/utils/cn";

type DivProps = React.HTMLAttributes<HTMLDivElement>;

/** White card, 12px radius. `feature` = 16px radius; `navy` = hero card. */
export function Card({
  className,
  variant = "default",
  ...props
}: DivProps & { variant?: "default" | "feature" | "navy" | "inset" }) {
  return (
    <div
      className={cn(
        "border-line border",
        variant === "default" && "rounded-card bg-white p-6",
        variant === "feature" && "rounded-feature bg-white p-6",
        variant === "navy" && "rounded-feature bg-navy-900 border-transparent p-6 text-white",
        variant === "inset" && "rounded-card bg-cream-soft border-transparent p-4",
        className,
      )}
      {...props}
    />
  );
}
