"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/shell/Avatar";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorCard } from "@/components/shared/ErrorCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { PageSkeleton } from "@/components/shared/Skeletons";
import { cn } from "@/lib/utils/cn";
import { ROUTES } from "@/lib/config/routes";
import { formatTime } from "@/lib/utils/dates";
import { usePanelistToday } from "../hooks/usePanelist";
import type { PanelItem } from "../schemas";

const WORDS = ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];

/** "P2: external specialist panel" is written "P2 · specialist panel" on this screen (p02.png). */
export function sessionLabel(title: string) {
  return title
    .replace(/^P1: first mock panel$/, "P1 · first mock")
    .replace(/^P2: external specialist panel$/, "P2 · specialist panel")
    .replace(/^P3: pressure mock$/, "P3 · pressure mock");
}

const initials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const targetLabel = (i: PanelItem) => (/^P\d/.test(i.title) ? `${i.target} MT` : i.target);

function BriefPill({ read }: { read: boolean }) {
  return (
    <span
      className={cn(
        "rounded-full px-3 py-1 text-xs font-bold tracking-wider whitespace-nowrap uppercase",
        read ? "bg-green-100 text-green-600" : "bg-maroon-100 text-maroon-600",
      )}
    >
      {read ? "Read" : "Not read yet"}
    </span>
  );
}

function TonightTable({ items, nextUnread }: { items: PanelItem[]; nextUnread?: string }) {
  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full min-w-[640px] text-left">
        <caption className="sr-only">Tonight&apos;s panels</caption>
        <thead>
          <tr className="text-navy-400 text-xs font-semibold tracking-[0.14em] uppercase">
            {["Time", "Student", "Session", "Target", "Brief"].map((h) => (
              <th key={h} scope="col" className="px-4 py-3 font-semibold">
                {h}
              </th>
            ))}
            <th scope="col" className="sr-only">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((i) => {
            const highlight = i.sessionId === nextUnread;
            return (
              <tr
                key={i.sessionId}
                className={cn("border-line border-t", highlight && "bg-cream/60")}
              >
                <td className="px-4 py-4 font-semibold whitespace-nowrap">
                  {formatTime(i.startsAt)}
                </td>
                <td className="px-4 py-4">
                  <span className="flex items-center gap-3">
                    <Avatar
                      initials={initials(i.studentName)}
                      tone="maroon"
                      className="size-10 text-xs"
                    />
                    <span>
                      <span className="block font-semibold">{i.studentName}</span>
                      <span className="text-navy-400 block text-sm">{i.plan}</span>
                    </span>
                  </span>
                </td>
                <td className="px-4 py-4">{sessionLabel(i.title)}</td>
                <td className="px-4 py-4">{targetLabel(i)}</td>
                <td className="px-4 py-4">
                  <BriefPill read={i.briefRead} />
                </td>
                <td className="px-4 py-4 text-right">
                  {i.briefRead ? (
                    <Button asChild variant="secondary">
                      <Link href={ROUTES.panelist.scoringSession(i.sessionId)}>Open scoring</Link>
                    </Button>
                  ) : (
                    <Button asChild variant={highlight ? "primary" : "secondary"}>
                      <Link href={ROUTES.panelist.brief(i.sessionId)}>Read brief</Link>
                    </Button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Phone: one card per panel (p02-mobile.png). */
function TonightCards({ items, nextUnread }: { items: PanelItem[]; nextUnread?: string }) {
  return (
    <ul className="space-y-3 md:hidden">
      {items.map((i) => (
        <li key={i.sessionId}>
          <Link
            href={
              i.briefRead
                ? ROUTES.panelist.scoringSession(i.sessionId)
                : ROUTES.panelist.brief(i.sessionId)
            }
            className={cn(
              "rounded-card flex min-h-[72px] items-center gap-4 border bg-white p-4",
              i.sessionId === nextUnread ? "border-maroon-600 border-2" : "border-line",
            )}
          >
            <span className="w-[72px] shrink-0 text-[15px] font-bold">
              {formatTime(i.startsAt)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold">{i.studentName}</span>
              <span className="text-navy-400 block truncate text-sm">
                {sessionLabel(i.title)}
                {/^P\d/.test(i.title) ? ` · ${targetLabel(i)}` : ` · ${i.target}`}
              </span>
            </span>
            <BriefPill read={i.briefRead} />
          </Link>
        </li>
      ))}
    </ul>
  );
}

function FeedbackDue({ items }: { items: PanelItem[] }) {
  return (
    <Card variant="feature" className="p-5 md:p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display max-md:text-maroon-600 text-2xl font-bold max-md:font-sans max-md:text-[13px] max-md:tracking-[0.16em] max-md:uppercase">
          Feedback due
        </h2>
        <span className="bg-maroon-100 text-maroon-600 rounded-full px-3 py-1 text-sm font-bold md:hidden">
          {items.length}
        </span>
      </div>
      {items.length === 0 ? (
        <p className="text-navy-400 mt-4 text-sm">All caught up.</p>
      ) : (
        <ul className="divide-line mt-3 divide-y">
          {items.map((i, n) => (
            <li key={i.sessionId} className="flex items-center justify-between gap-3 py-4">
              <div className="min-w-0">
                <p className="font-semibold">
                  {i.studentName}{" "}
                  <span className="font-normal md:hidden">· {i.title.slice(0, 2)}</span>
                </p>
                <p className="text-navy-400 hidden text-sm md:block">
                  {i.title.slice(0, 2)} ·{" "}
                  {new Date(i.startsAt).toLocaleDateString("en-IN", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    timeZone: "Asia/Kolkata",
                  })}
                </p>
              </div>
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-bold tracking-wider uppercase max-md:bg-transparent max-md:px-0 max-md:text-sm max-md:font-semibold max-md:tracking-normal max-md:normal-case",
                  i.dueLabel === "Due tomorrow"
                    ? "bg-gold-500/15 max-md:text-navy-400 text-[#6b4f10]"
                    : "bg-maroon-100 text-maroon-600",
                )}
              >
                <span className="md:hidden">
                  {i.dueLabel?.replace("Due ", "") === "today" ? "Today" : "Tomorrow"}
                </span>
                <span className="max-md:hidden">{i.dueLabel}</span>
              </span>
              <Button asChild variant={n === 0 ? "primary" : "secondary"} className="max-md:hidden">
                <Link href={ROUTES.panelist.scoringSession(i.sessionId)}>Write feedback</Link>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

/** P2 today (p02.png, p02-mobile.png). */
export function TodayView() {
  const { data, isPending, isError, refetch } = usePanelistToday();
  if (isPending) return <PageSkeleton />;
  if (isError || !data) return <ErrorCard onRetry={() => refetch()} />;

  const { panelist, today, awaitingScore } = data;
  const first = panelist.name.split(" ")[0];
  const n = today.length;
  const nextUnread = today.find((i) => !i.briefRead)?.sessionId;

  return (
    <div className="mx-auto max-w-[1440px] space-y-6 p-4 md:p-8 xl:px-10">
      <PageHeader
        eyebrow="Mon 5 Oct 2026"
        title={
          n === 0
            ? `No panels tonight, ${first}.`
            : `${WORDS[n] ?? n} ${n === 1 ? "panel" : "panels"} tonight, ${first}.`
        }
      />

      <section aria-label="Your numbers" className="hidden gap-4 md:grid md:grid-cols-4">
        <Stat label="Panels today" value={String(n)} />
        <Stat label="Feedback due" value={String(awaitingScore.length)} tone="maroon" />
        <Stat label="This season" value={String(panelist.panelsThisSeason)} />
        <Stat label="Avg. feedback turnaround" value="20 h" hint="Proposed metric" />
      </section>

      <section aria-labelledby="tonight-h">
        <Card variant="feature" className="p-0 max-md:border-0 max-md:bg-transparent md:p-6">
          <div className="flex items-center justify-between max-md:sr-only">
            <h2 id="tonight-h" className="font-display text-2xl font-bold">
              Tonight
            </h2>
            <Link
              href={ROUTES.panelist.availability}
              className="text-maroon-600 text-sm font-semibold underline"
            >
              Full calendar →
            </Link>
          </div>
          {n === 0 ? (
            <div className="mt-4">
              <EmptyState title="No panels tonight" body="Your next panel is under Briefs." />
            </div>
          ) : (
            <>
              <TonightTable items={today} nextUnread={nextUnread} />
              <TonightCards items={today} nextUnread={nextUnread} />
            </>
          )}
        </Card>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_420px]">
        <FeedbackDue items={awaitingScore} />
        <Card variant="inset" className="hidden self-start p-6 lg:block">
          <h2 className="text-maroon-600 text-[13px] font-semibold tracking-[0.16em] uppercase">
            How a good panel works here
          </h2>
          <p className="mt-4 text-[17px] leading-relaxed">
            Read the brief. Pull on the CV. Ask the flagged questions again. Then write feedback the
            student can act on before the next panel.
          </p>
        </Card>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "maroon";
}) {
  return (
    <Card variant="feature" className="p-5">
      <p className="text-navy-400 text-sm">{label}</p>
      <p
        className={cn(
          "font-display mt-3 text-4xl font-bold",
          tone === "maroon" && "text-maroon-600",
        )}
      >
        {value}
      </p>
      {hint && <p className="text-navy-400 mt-1 text-sm">{hint}</p>}
    </Card>
  );
}
