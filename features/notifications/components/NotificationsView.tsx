"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorCard } from "@/components/shared/ErrorCard";
import { Skeleton } from "@/components/shared/Skeletons";
import { formatDay, formatTime } from "@/lib/utils/dates";
import { useMarkRead, useNotifications } from "../hooks/useNotifications";
import { NotificationItem } from "./NotificationItem";

/** The list used by both the /notifications page and the bell drawer. */
export function NotificationList({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useNotifications();
  const mark = useMarkRead();

  if (isLoading) {
    return (
      <div role="status" aria-label="Loading notifications" className="space-y-2 p-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-14" />
        ))}
      </div>
    );
  }
  if (isError || !data) return <ErrorCard onRetry={() => refetch()} />;
  if (data.items.length === 0) {
    return <EmptyState title="You are all caught up" body="New updates will show here." />;
  }

  return (
    <div>
      <div className="flex items-center justify-between px-4 py-2">
        <p className="text-navy-400 text-xs font-semibold tracking-wider uppercase">
          {data.unread} unread
        </p>
        <Button
          size="sm"
          variant="ghost"
          disabled={data.unread === 0}
          onClick={() => mark.mutate({ all: true })}
        >
          Mark All Read
        </Button>
      </div>
      <ul>
        {data.items.map((n) => (
          <li key={n.id}>
            <NotificationItem
              title={n.title}
              body={n.body ?? undefined}
              time={`${formatDay(n.at)} · ${formatTime(n.at)}`}
              read={n.read}
              onRead={() => {
                if (!n.read) mark.mutate({ ids: [n.id] });
                if (n.href) {
                  onNavigate?.();
                  router.push(n.href);
                }
              }}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

/** E10 full page. */
export function NotificationsPage() {
  return (
    <div className="mx-auto max-w-2xl p-4 md:p-8">
      <h1 className="font-display text-3xl font-bold">Notifications</h1>
      <div className="rounded-card border-line mt-4 overflow-hidden border bg-white">
        <NotificationList />
      </div>
    </div>
  );
}
