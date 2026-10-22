"use client";

import { useLinkStatus } from "next/link";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils/cn";

/** Spinner for the nearest parent `Link` while its navigation is pending. Render it inside the Link. */
export function LinkSpinner({ className }: { className?: string }) {
  const { pending } = useLinkStatus();
  return pending ? <Spinner className={cn("size-3.5", className)} /> : null;
}
