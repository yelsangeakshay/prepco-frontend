"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorCard } from "@/components/shared/ErrorCard";
import { Skeleton } from "@/components/shared/Skeletons";
import { ROUTES } from "@/lib/config/routes";
import { cn } from "@/lib/utils/cn";
import { useDebounced } from "@/lib/utils/useDebounced";
import { useUrlState } from "@/lib/utils/useUrlState";
import { useAnswers } from "../hooks/useAnswers";
import { AnswerCard } from "./AnswerCard";

const TABS = [
  { key: "", label: "All", count: "all" },
  { key: "rehearsed", label: "Rehearsed", count: "rehearsed" },
  { key: "flagged", label: "Flagged", count: "flagged" },
  { key: "not-drafted", label: "Not drafted", count: "notDrafted" },
] as const;

const PAGE_SIZE = 25;

/** S8 HR Question Builder: filters, search and page live in the URL. */
export function AnswersView() {
  const router = useRouter();
  const { params, set } = useUrlState();
  const status = params.get("status") ?? "";
  const urlQ = params.get("q") ?? "";
  const page = Number(params.get("page") ?? 1);

  const [q, setQ] = useState(urlQ);
  const debounced = useDebounced(q, 300);
  useEffect(() => {
    if (debounced !== urlQ) set({ q: debounced }, { resetPage: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const { data, isPending, isError, refetch, isFetching } = useAnswers({
    status: status || undefined,
    q: urlQ || undefined,
    page,
    pageSize: PAGE_SIZE,
  });

  const pageCount = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-4 md:p-8">
      <div>
        <h1 className="font-display text-3xl font-bold">HR Question Builder</h1>
        {data && (
          <p className="text-navy-400 text-sm">
            {data.counts.rehearsed} of {data.counts.all} prepared
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div role="tablist" aria-label="Filter answers" className="flex flex-wrap gap-2">
          {TABS.map((t) => {
            const active = status === t.key;
            return (
              <button
                key={t.key || "all"}
                role="tab"
                aria-selected={active}
                type="button"
                onClick={() => set({ status: t.key }, { resetPage: true })}
                className={cn(
                  "min-h-11 rounded-full border px-4 text-sm font-semibold",
                  active ? "border-maroon-600 bg-maroon-600 text-white" : "border-line bg-white",
                )}
              >
                {t.label}
                {data && <span className="ml-1.5 opacity-80">{data.counts[t.count]}</span>}
              </button>
            );
          })}
        </div>
        <div className="relative md:w-64">
          <Search className="text-navy-400 absolute top-3.5 left-3 size-4" aria-hidden />
          <Input
            type="search"
            aria-label="Search questions"
            placeholder="Search questions"
            className="pl-9"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      {isError ? (
        <ErrorCard onRetry={() => refetch()} />
      ) : isPending ? (
        <div role="status" aria-label="Loading answers" className="space-y-3">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : data && data.items.length === 0 ? (
        <EmptyState
          title="No answers match"
          body={q ? "Try a different search." : "Nothing in this filter."}
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setQ("");
                set({ q: "", status: "" }, { resetPage: true });
              }}
            >
              Clear Filters
            </Button>
          }
        />
      ) : (
        <ul className={cn("space-y-3", isFetching && "opacity-70")}>
          {data?.items.map((a) => (
            <li key={a.id}>
              <AnswerCard
                question={a.question}
                status={a.status}
                snippet={a.snippet ?? undefined}
                critique={a.critique ?? undefined}
                onOpen={() => router.push(ROUTES.student.answer(a.id))}
              />
            </li>
          ))}
        </ul>
      )}

      {data && pageCount > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-navy-400">
            Page {page} of {pageCount}
          </span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => set({ page: page - 1 })}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= pageCount}
              onClick={() => set({ page: page + 1 })}
            >
              Next
            </Button>
          </div>
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
