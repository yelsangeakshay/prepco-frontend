"use client";

import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { NotificationList } from "@/features/notifications/components/NotificationsView";
import { ROUTES } from "@/lib/config/routes";

/** Loaded lazily when the bell is first opened. */
export default function BellDrawer({ onClose }: { onClose: () => void }) {
  return (
    <Dialog.Root open onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-white shadow-lg">
          <div className="border-line flex items-center justify-between border-b px-4 py-3">
            <Dialog.Title className="font-display text-lg font-bold">Notifications</Dialog.Title>
            <Dialog.Close aria-label="Close" className="flex size-11 items-center justify-center">
              <X className="size-5" />
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">Your latest updates</Dialog.Description>
          <div className="flex-1 overflow-y-auto">
            <NotificationList onNavigate={onClose} />
          </div>
          <div className="border-line border-t p-3 text-center">
            <Link
              href={ROUTES.student.notifications}
              onClick={onClose}
              className="text-maroon-600 text-sm font-semibold underline"
            >
              See all notifications
            </Link>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
