import Link from "next/link";
import { Bell } from "lucide-react";
import { ROUTES } from "@/lib/config/routes";

/** Phase 1: links to /notifications. The drawer arrives with E10 in Phase 4. */
export function NotificationBell({ unread = 0 }: { unread?: number }) {
  return (
    <Link
      href={ROUTES.student.notifications}
      aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
      className="rounded-control hover:bg-cream-soft relative flex size-11 items-center justify-center"
    >
      <Bell className="size-5" aria-hidden />
      {unread > 0 && (
        <span className="bg-maroon-600 absolute top-2.5 right-2.5 size-2 rounded-full" />
      )}
    </Link>
  );
}
