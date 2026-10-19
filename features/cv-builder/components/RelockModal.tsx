"use client";

import dynamic from "next/dynamic";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Skeleton } from "@/components/shared/Skeletons";

const RelockForm = dynamic(() => import("./RelockForm"), {
  ssr: false,
  loading: () => <Skeleton className="mt-4 h-40 w-full" />,
});

/** Loaded lazily, only after the student asks to request a re-lock. */
export default function RelockModal({ onClose }: { onClose: () => void }) {
  return (
    <Dialog.Root open onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content className="rounded-feature fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 bg-white p-6">
          <div className="flex items-start justify-between">
            <Dialog.Title className="font-display text-xl font-bold">
              Request a re-lock
            </Dialog.Title>
            <Dialog.Close aria-label="Close" className="flex size-11 items-center justify-center">
              <X className="size-5" />
            </Dialog.Close>
          </div>
          <Dialog.Description className="text-navy-400 mt-1 text-sm">
            Your locked CV is what panelists see. Ops will review your draft before it replaces it.
          </Dialog.Description>
          <RelockForm onDone={onClose} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
