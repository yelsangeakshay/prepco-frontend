"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";
import { useDelayedFlag } from "@/lib/utils/useDelayedFlag";
import { Spinner } from "./spinner";

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

type ButtonBase = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

/**
 * `loading` disables the button at once and, if it lasts over 150 ms, overlays a spinner while the label keeps
 * its width. A Slot takes one child, so a link-styled button (`asChild`) cannot be `loading`: use the pending
 * state of the link instead.
 */
export type ButtonProps =
  | (ButtonBase & { asChild?: false; loading?: boolean })
  | (ButtonBase & { asChild: true; loading?: never });

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, loading, type, disabled, children, ...props }, ref) => {
    const spinning = useDelayedFlag(!!loading);
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : (type ?? "button")}
        disabled={asChild ? disabled : disabled || loading}
        aria-busy={loading || undefined}
        className={cn(
          buttonVariants({ variant, size }),
          loading && "relative disabled:opacity-80",
          className,
        )}
        {...props}
      >
        {loading ? (
          <>
            <span className={cn("inline-flex items-center gap-2", spinning && "opacity-0")}>
              {children}
            </span>
            {spinning && <Spinner className="absolute" />}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";
