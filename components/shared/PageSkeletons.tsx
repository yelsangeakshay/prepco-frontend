import { cn } from "@/lib/utils/cn";
import { Skeleton } from "./Skeletons";

/**
 * Page-shaped skeletons. Each is used twice: by the route's `loading.tsx` and by the view while its first
 * query is pending, so the shape does not change between the two.
 */
function Frame({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <div role="status" aria-label="Loading" className={cn("mx-auto space-y-6", className)}>
      {children}
    </div>
  );
}

function Heading() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-10 w-full max-w-md" />
    </div>
  );
}

/** Student home: next-up hero, runway strip, three summary cards, this week. */
export function HomeSkeleton() {
  return (
    <Frame className="max-w-[1440px] p-4 md:p-8 xl:px-10">
      <Heading />
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Skeleton className="h-72" />
        <Skeleton className="hidden h-72 lg:block" />
      </div>
      <Skeleton className="h-44" />
      <div className="grid gap-6 md:grid-cols-3">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </Frame>
  );
}

/** Sessions and runway: the timeline on the left, the top-up and panel cards on the right. */
export function SessionsSkeleton() {
  return (
    <Frame className="max-w-6xl p-4 md:p-8">
      <Heading />
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="hidden space-y-4 lg:block">
          <Skeleton className="h-60" />
          <Skeleton className="h-40" />
        </div>
      </div>
    </Frame>
  );
}

/** The answer list rows. Shared by the route skeleton and the view, which renders its own header. */
export function AnswersListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div role="status" aria-label="Loading answers" className="space-y-3">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-16" />
      ))}
    </div>
  );
}

export function AnswersSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-5 p-4 md:p-8">
      <Heading />
      <Skeleton className="h-11 w-full max-w-sm" />
      <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
        <AnswersListSkeleton rows={6} />
        <Skeleton className="hidden h-[480px] lg:block" />
      </div>
    </div>
  );
}

/** A title, an optional row of stat cards, then stacked row cards (panelist today and scoring lists). */
export function ListPageSkeleton({ stats = 0, rows = 5 }: { stats?: number; rows?: number }) {
  return (
    <Frame className="max-w-[1440px] p-4 md:p-8 xl:px-10">
      <Heading />
      {stats > 0 && (
        <div className="grid gap-6 md:grid-cols-3">
          {Array.from({ length: stats }, (_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      )}
      <div className="space-y-3">
        {Array.from({ length: rows }, (_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    </Frame>
  );
}

/** Ops cohort overview: seat cards, two panels, the attention list. */
export function OpsOverviewSkeleton() {
  return (
    <Frame className="max-w-[1440px] p-4 md:p-8 xl:px-10">
      <Heading />
      <div className="grid gap-6 md:grid-cols-3">
        <Skeleton className="h-44" />
        <Skeleton className="h-44" />
        <Skeleton className="h-44" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
      </div>
      <Skeleton className="h-72" />
    </Frame>
  );
}

/** Ops list pages: a title, a filter bar and table rows. */
export function TablePageSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <Frame className="max-w-7xl space-y-5 p-4 md:p-8">
      <Heading />
      <Skeleton className="h-11 w-full max-w-md" />
      <div className="space-y-2">
        {Array.from({ length: rows }, (_, i) => (
          <Skeleton key={i} className="h-12" />
        ))}
      </div>
    </Frame>
  );
}
