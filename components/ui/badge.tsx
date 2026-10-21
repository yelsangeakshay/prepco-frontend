import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

export const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold tracking-wider whitespace-nowrap uppercase",
  {
    variants: {
      tone: {
        neutral: "bg-cream-soft text-navy-900",
        green: "bg-green-100 text-green-600",
        maroon: "bg-maroon-600 text-white",
        maroonSoft: "bg-maroon-100 text-maroon-600",
        gold: "bg-gold-500 text-navy-900",
        goldSoft: "bg-gold-500/15 text-[#7a5c14]",
        navy: "bg-navy-900 text-white",
        outline: "border border-dashed border-navy-400 text-navy-400",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
