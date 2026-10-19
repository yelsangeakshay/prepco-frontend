import { cn } from "@/lib/utils/cn";

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("bg-cream-soft animate-pulse rounded-lg", className)} />;
}

export function PageSkeleton() {
  return (
    <div role="status" aria-label="Loading" className="mx-auto max-w-5xl space-y-4 p-6 md:p-10">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-40 w-full" />
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
    </div>
  );
}
