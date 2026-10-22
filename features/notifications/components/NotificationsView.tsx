"use client";

import { useState } from "react";
import { useNavigate } from "@/lib/nav/useNavigate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { cn } from "@/lib/utils/cn";
import { now } from "@/lib/utils/clock";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorCard } from "@/components/shared/ErrorCard";
import { Skeleton } from "@/components/shared/Skeletons";
import { formatDay, formatTime } from "@/lib/utils/dates";
import { useMarkRead, useNotifications } from "../hooks/useNotifications";
import { NotificationItem } from "./NotificationItem";

/** The list used by both the /notifications page and the bell drawer. */
export function NotificationList({ onNavigate }: { onNavigate?: () => void }) {
  const { navigate } = useNavigate();
  const { data, isPending, isError, refetch } = useNotifications();
  const mark = useMarkRead();

  if (isPending) {
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
                  navigate(n.href);
                }
              }}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

const CHANNELS = ["Email", "WhatsApp", "Push"] as const;

/** What we tell people and how (e10.png). Runway changes always go by email. */
const PREFERENCES: { id: string; label: string; on: boolean[]; locked?: number }[] = [
  { id: "sessions", label: "Session reminders", on: [true, true, true] },
  { id: "feedback", label: "Feedback & reviews ready", on: [true, false, true] },
  { id: "runway", label: "Runway or Day 0 changes", on: [true, true, true], locked: 0 },
  { id: "digest", label: "Quick Switch digest", on: [true, false, false] },
];

function ReachYou() {
  const [prefs, setPrefs] = useState(() => PREFERENCES.map((p) => p.on));
  return (
    <Card variant="feature" className="p-4 md:p-6">
      <h2 className="text-maroon-600 text-[13px] font-semibold tracking-[0.16em] uppercase">
        How to reach you
      </h2>
      <table className="mt-4 w-full table-fixed text-left">
        <thead>
          <tr className="text-navy-400 text-xs font-semibold tracking-wider uppercase">
            <td className="pb-2" />
            {CHANNELS.map((c) => (
              <th
                key={c}
                scope="col"
                className="w-[62px] pb-2 text-center text-[10px] font-semibold sm:w-[74px]"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PREFERENCES.map((p, row) => (
            <tr key={p.id} className="border-line border-t">
              <th scope="row" className="py-3 pr-2 text-sm font-normal">
                {p.label}
              </th>
              {CHANNELS.map((c, col) => (
                <td key={c} className="text-center">
                  <input
                    type="checkbox"
                    aria-label={`${p.label} by ${c}`}
                    className="accent-maroon-600 size-5 align-middle"
                    checked={prefs[row]![col]!}
                    disabled={p.locked === col}
                    onChange={(e) =>
                      setPrefs((all) =>
                        all.map((r, i) =>
                          i === row ? r.map((v, j) => (j === col ? e.target.checked : v)) : r,
                        ),
                      )
                    }
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-navy-400 mt-3 text-sm">
        Runway changes always come by email. WhatsApp channel is proposed.
      </p>
    </Card>
  );
}

/** E10 full page: today and earlier on the left, the channel grid on the right (e10.png). */
export function NotificationsPage() {
  const { navigate } = useNavigate();
  const { data, isPending, isError, refetch } = useNotifications();
  const mark = useMarkRead();

  const today = formatDay(now());
  const items = data?.items ?? [];
  const groups = [
    { title: "Today", rows: items.filter((n) => formatDay(n.at) === today) },
    { title: "Earlier", rows: items.filter((n) => formatDay(n.at) !== today) },
  ].filter((g) => g.rows.length > 0);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader title="Notifications" className="md:pr-0" />
        <div className="flex shrink-0 items-center gap-3 pt-1 md:mr-72">
          <p className="text-navy-400 text-xs font-semibold tracking-wider uppercase">
            {data?.unread ?? 0} unread
          </p>
          <Button
            variant="secondary"
            disabled={!data || data.unread === 0}
            onClick={() => mark.mutate({ all: true })}
          >
            Mark all read
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <Card variant="feature" className="p-4 md:p-6">
          {isPending ? (
            <div role="status" aria-label="Loading notifications" className="space-y-2">
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="h-14" />
              ))}
            </div>
          ) : isError ? (
            <ErrorCard onRetry={() => refetch()} />
          ) : items.length === 0 ? (
            <EmptyState title="You are all caught up" body="New updates will show here." />
          ) : (
            groups.map((g) => (
              <section key={g.title} className="[&:not(:first-child)]:mt-6">
                <h2 className="text-navy-400 text-xs font-semibold tracking-[0.16em] uppercase">
                  {g.title}
                </h2>
                <ul className="mt-3">
                  {g.rows.map((n) => (
                    <li key={n.id} className="border-line border-b last:border-0">
                      <button
                        type="button"
                        className="flex min-h-14 w-full gap-3 py-4 text-left"
                        onClick={() => {
                          if (!n.read) mark.mutate({ ids: [n.id] });
                          if (n.href) navigate(n.href);
                        }}
                      >
                        <span
                          aria-hidden
                          className={cn(
                            "mt-1.5 size-3 shrink-0 rounded-full border",
                            n.read ? "border-line bg-white" : "bg-maroon-600 border-maroon-600",
                          )}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                            <span className="font-semibold">
                              {n.title}
                              {!n.read && <span className="sr-only"> (unread)</span>}
                            </span>
                            {n.tag ? (
                              <Badge tone="maroonSoft">{n.tag}</Badge>
                            ) : g.title === "Today" ? (
                              <span className="text-navy-400 text-sm">{formatTime(n.at)}</span>
                            ) : null}
                          </span>
                          {(n.body || g.title === "Earlier") && (
                            <span className="text-navy-400 mt-0.5 block text-[15px]">
                              {[n.body, g.title === "Earlier" ? formatDay(n.at) : null]
                                .filter(Boolean)
                                .join(" · ")}
                            </span>
                          )}
                          {n.action && (
                            <span className="text-maroon-600 mt-1 inline-block text-[15px] font-medium underline underline-offset-4">
                              {n.action} →
                            </span>
                          )}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))
          )}
        </Card>
        <ReachYou />
      </div>
    </div>
  );
}
