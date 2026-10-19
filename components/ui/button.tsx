import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

export const buttonVariants = cva(
  "rounded-control inline-flex min-h-11 items-center justify-center gap-2 px-5 text-sm font-semibold whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-maroon-600 hover:bg-maroon-700 text-white",
        secondary: "border-line text-navy-900 hover:bg-cream-soft border bg-white",
        ghost: "text-navy-900 hover:bg-cream-soft",
        gold: "bg-gold-500 text-navy-900 hover:bg-gold-300",
        onNavy: "bg-white text-navy-900 hover:bg-cream-soft",
      },
      size: { default: "", sm: "min-h-11 px-4 md:min-h-9", icon: "size-11 px-0" },
    },
    defaultVariants: { variant: "primary", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, type, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : (type ?? "button")}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
