"use client";

import { useApiStatus } from "@/components/shell/Providers";
import { FormAlert } from "./AuthShell";

/** Shown when the mock service worker did not start within 8 s, so a disabled submit is never unexplained. */
export function ApiBootNotice() {
  const status = useApiStatus();
  if (status !== "failed") return null;
  return (
    <FormAlert>
      Couldn&apos;t connect to the preview service.{" "}
      <button
        type="button"
        className="font-semibold underline"
        onClick={() => window.location.reload()}
      >
        Retry
      </button>
    </FormAlert>
  );
}
