"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorCard } from "@/components/shared/ErrorCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { AnswersListSkeleton } from "@/components/shared/PageSkeletons";
import { FilterPills } from "@/components/shared/FilterPills";
import { ROUTES } from "@/lib/config/routes";
import { cn } from "@/lib/utils/cn";
import { useUrlState } from "@/lib/utils/useUrlState";
import { useAnswers } from "../hooks/useAnswers";
import type { AnswerSummary } from "../schemas";
import { AnswerCard } from "./AnswerCard";
import { AnswerPanel } from "./AnswerPanel";

const TABS = [
  { key: "", label: "All", count: "all" },
  { key: "rehearsed", label: "Rehearsed", count: "rehearsed" },
  { key: "flagged", label: "Flagged", count: "flagged" },
  { key: "not-drafted", label: "Not drafted", count: "notDrafted" },
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

/** S8 Answer bank (HR Question Builder in the mockups): list on the left, the selected answer on the right (s08.png). */
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
          title={
            <>
              <span className="md:hidden">
                {roundLabel} · {data ? (round === "fit" ? data.rounds.fit : data.rounds.cv) : ""}{" "}
                questions
              </span>
              <span className="hidden md:inline">Answer bank</span>
            </>
          }
          subtitle={
            <span className="hidden md:inline">
              Built around your CV + target role + company. You draft, we mark what&apos;s weak, you
              rehearse it in your next panel.
            </span>
          }
        />
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
        <FilterPills
          label="Filter answers"
          active={status}
          onSelect={(key) => set({ status: key, a: "" }, { resetPage: true })}
          pills={TABS.map((t) => ({
            key: t.key,
            label: t.label,
            count: data ? data.counts[t.count] : undefined,
          }))}
        />
      </div>

      {isError ? (
        <ErrorCard onRetry={() => refetch()} />
      ) : isPending ? (
        <AnswersListSkeleton />
      ) : items.length === 0 ? (
        <EmptyState
          title="No answers match"
          body="Nothing in this filter."
          action={
            <Button variant="secondary" onClick={() => set({ status: "", a: "" })}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
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
