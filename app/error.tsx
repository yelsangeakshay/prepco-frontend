"use client";

import { ErrorCard } from "@/components/shared/ErrorCard";

export default function RootError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <ErrorCard onRetry={reset} />
    </main>
  );
}
