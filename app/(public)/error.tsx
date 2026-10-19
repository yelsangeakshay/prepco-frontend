"use client";

import { ErrorCard } from "@/components/shared/ErrorCard";

export default function GroupError({ reset }: { error: Error; reset: () => void }) {
  return <ErrorCard onRetry={reset} />;
}
