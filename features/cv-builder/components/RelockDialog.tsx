"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";

const RelockModal = dynamic(() => import("./RelockModal"), { ssr: false });

/** Ops reviews re-lock requests (Proposed: within one working day). The modal loads on first click. */
export function RelockDialog({ disabled }: { disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);

  return (
    <>
      <Button ref={trigger} variant="secondary" disabled={disabled} onClick={() => setOpen(true)}>
        Request Re-lock
      </Button>
      {open && (
        <RelockModal
          onClose={() => {
            setOpen(false);
            requestAnimationFrame(() => trigger.current?.focus());
          }}
        />
      )}
    </>
  );
}
