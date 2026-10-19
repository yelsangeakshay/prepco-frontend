"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Bell } from "lucide-react";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";

const BellDrawer = dynamic(() => import("./BellDrawer"), { ssr: false });

/** Bell with an unread dot. The drawer (on every page) loads on first click. */
export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const { data } = useNotifications();
  const unread = data?.unread ?? 0;

  return (
    <>
      <button
        ref={trigger}
        type="button"
        aria-haspopup="dialog"
        aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
        onClick={() => setOpen(true)}
        className="rounded-control hover:bg-cream-soft relative flex size-11 items-center justify-center"
      >
        <Bell className="size-5" aria-hidden />
        {unread > 0 && (
          <span
            data-testid="bell-dot"
            className="bg-maroon-600 absolute top-2.5 right-2.5 size-2 rounded-full"
          />
        )}
      </button>
      {open && (
        <BellDrawer
          onClose={() => {
            setOpen(false);
            requestAnimationFrame(() => trigger.current?.focus());
          }}
        />
      )}
    </>
  );
}
