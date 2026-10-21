"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorCard } from "@/components/shared/ErrorCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { Skeleton } from "@/components/shared/Skeletons";
import { ROUTES } from "@/lib/config/routes";
import { cn } from "@/lib/utils/cn";
import { useUrlState } from "@/lib/utils/useUrlState";
import { useAnswers } from "../hooks/useAnswers";
import type { AnswerSummary } from "../schemas";
import { AnswerCard } from "./AnswerCard";
import { AnswerPanel } from "./AnswerPanel";

const TABS = [
  { key: "", label: "All" },
  { key: "rehearsed", label: "Rehearsed" },
  { key: "flagged", label: "Flagged" },
  { key: "not-drafted", label: "Not drafted" },
] as const;

const ROUNDS = [
  { key: "fit", label: "Fit round" },
  { key: "cv", label: "CV deep-dive" },
] as const;

/** Rows shown before "+ N more", as drawn in s08.png. */
const SHOWN = 7;

/** True from the `lg` breakpoint up, where the editor sits beside the list. */
function useWide() {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia("(min-width: 1024px)");
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia("(min-width: 1024px)").matches,
    () => false,
  );
}

function Row({
  a,
  selected,
  onSelect,
  wide,
}: {
  a: AnswerSummary;
  selected: boolean;
  onSelect: () => void;
  wide: boolean;
}) {
  return (
    <Link
      href={ROUTES.student.answer(a.id)}
      data-testid="answer-row"
      aria-current={selected ? "true" : undefined}
      onClick={(e) => {
        if (!wide) return;
        e.preventDefault();
        onSelect();
      }}
      className="rounded-card block"
    >
      <AnswerCard
        question={a.question}
        status={a.status}
        selected={selected}
        critique={a.critique}
        noteTags={a.noteTags}
      />
    </Link>
  );
}

/** S8 HR Question Builder: list on the left, the selected answer on the right (s08.png). */
export function AnswersView() {
  const { params, set } = useUrlState();
  const wide = useWide();
  const status = params.get("status") ?? "";
  const round = params.get("round") === "cv" ? "cv" : "fit";
  const urlSelected = params.get("a") ?? "";
  const [expanded, setExpanded] = useState(false);

  const { data, isPending, isError, refetch, isFetching } = useAnswers({
    status: status || undefined,
    round,
    page: 1,
    pageSize: 50,
  });

  const items = data?.items ?? [];
  const roundLabel = ROUNDS.find((r) => r.key === round)!.label;
  const selected =
    items.find((a) => a.id === urlSelected) ??
    items.find((a) => a.status === "flagged") ??
    items[0];
  const visible = status || expanded ? items : items.slice(0, SHOWN);
  const hidden = items.length - visible.length;

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-4 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:pr-72">
        <PageHeader
          className="md:pr-0"
          eyebrow="HR Question Builder"
          pill="In every plan"
          pillClassName="hidden md:inline-block"
          title={
            <>
              <span className="md:hidden">
                {roundLabel} · {data ? (round === "fit" ? data.rounds.fit : data.rounds.cv) : ""}{" "}
                questions
              </span>
              <span className="hidden md:inline">Your answer bank, built from your own CV.</span>
            </>
          }
          subtitle={
            <span className="hidden md:inline">
              Built around your CV + target role + company. You draft, we mark what&apos;s weak, you
              rehearse it in your next panel.
            </span>
          }
        />
        {data && (
          <dl className="grid grid-cols-3 gap-3 text-center md:flex md:gap-6">
            {[
              { label: "Questions", value: data.counts.all, tone: "" },
              { label: "Prepared", value: data.counts.rehearsed, tone: "" },
              { label: "Need work", value: data.counts.flagged, tone: "maroon" },
            ].map((s) => (
              <div
                key={s.label}
                className={cn(
                  "rounded-card border-line border bg-white p-3 md:border-0 md:bg-transparent md:p-0",
                  s.tone === "maroon" && "bg-maroon-100 border-transparent",
                )}
              >
                <dd
                  className={cn(
                    "font-display text-3xl leading-none font-bold",
                    s.tone === "maroon" && "text-maroon-600",
                  )}
                >
                  {s.value}
                </dd>
                <dt
                  className={cn(
                    "text-navy-400 mt-1 text-sm whitespace-nowrap",
                    s.tone === "maroon" && "text-maroon-600",
                  )}
                >
                  {s.label}
                </dt>
              </div>
            ))}
          </dl>
        )}
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div
          role="tablist"
          aria-label="Question round"
          className="bg-cream-soft inline-flex w-fit gap-1 rounded-full p-1"
        >
          {ROUNDS.map((r) => {
            const active = round === r.key;
            return (
              <button
                key={r.key}
                role="tab"
                aria-selected={active}
                type="button"
                onClick={() => {
                  setExpanded(false);
                  set({ round: r.key === "fit" ? "" : r.key, a: "" }, { resetPage: true });
                }}
                className={cn(
                  "min-h-11 rounded-full px-4 text-sm font-semibold",
                  active ? "text-navy-900 bg-white" : "text-navy-400",
                )}
              >
                {r.label}
                {data && (
                  <span className="bg-cream-soft ml-2 rounded-full px-2 py-0.5 text-xs">
                    {data.rounds[r.key]}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div role="tablist" aria-label="Filter answers" className="flex flex-wrap gap-2">
          {TABS.map((t) => {
            const active = status === t.key;
            return (
              <button
                key={t.key || "all"}
                role="tab"
                aria-selected={active}
                type="button"
                onClick={() => set({ status: t.key, a: "" }, { resetPage: true })}
                className={cn(
                  "min-h-11 rounded-full border px-4 text-sm font-semibold",
                  active ? "border-maroon-600 bg-maroon-600 text-white" : "border-line bg-white",
                )}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {isError ? (
        <ErrorCard onRetry={() => refetch()} />
      ) : isPending ? (
        <div role="status" aria-label="Loading answers" className="space-y-3">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="No answers match"
          body="Nothing in this filter."
          action={
            <Button variant="secondary" onClick={() => set({ status: "", a: "" })}>
              Clear Filters
            </Button>
          }
        />
      ) : (
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <div>
            <ul className={cn("space-y-3", isFetching && "opacity-70")}>
              {visible.map((a) => (
                <li key={a.id}>
                  <Row
                    a={a}
                    wide={wide}
                    selected={a.id === selected?.id}
                    onSelect={() => set({ a: a.id })}
                  />
                </li>
              ))}
            </ul>
            {hidden > 0 && (
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="text-navy-400 mt-3 min-h-11 px-1 text-sm"
              >
                + {hidden} more in {roundLabel}
              </button>
            )}
          </div>
          {wide && selected && (
            <div className="sticky top-6">
              <AnswerPanel id={selected.id} />
            </div>
          )}
        </div>
      )}

      <p className="text-center text-xs">
        <Link href={ROUTES.student.quickSwitch} className="text-maroon-600 font-semibold underline">
          Switching target? Try Quick Switch
        </Link>
      </p>
    </div>
  );
}
