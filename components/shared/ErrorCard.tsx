"use client";

import { AlertTriangle } from "lucide-react";

interface Props {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorCard({
  title = "Something went wrong",
  message = "We could not load this. Please try again.",
  onRetry,
}: Props) {
  return (
    <div
      role="alert"
      className="rounded-card border-line mx-auto my-10 max-w-md border bg-white p-6 text-center"
    >
      <AlertTriangle className="text-maroon-600 mx-auto size-8" aria-hidden />
      <h2 className="font-display mt-3 text-xl font-bold">{title}</h2>
      <p className="text-navy-400 mt-1 text-sm">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="bg-maroon-600 hover:bg-maroon-700 rounded-control mt-4 min-h-11 px-5 text-sm font-semibold text-white"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
