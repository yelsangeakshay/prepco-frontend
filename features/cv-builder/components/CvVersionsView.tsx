"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorCard } from "@/components/shared/ErrorCard";
import { LockedVersionBadge } from "@/components/shared/Badges";
import { PageSkeleton } from "@/components/shared/Skeletons";
import { ROUTES } from "@/lib/config/routes";
import { formatDay } from "@/lib/utils/dates";
import { useCv, useCvVersions, useLockVersion } from "../hooks/useCv";
import { RelockDialog } from "./RelockDialog";

/** S7 versions, lock, and re-lock request. */
export function CvVersionsView() {
  const versions = useCvVersions();
  const cv = useCv();
  const lock = useLockVersion();

  if (versions.isPending || cv.isPending) return <PageSkeleton />;
  if (versions.isError || cv.isError || !versions.data || !cv.data) {
    return (
      <ErrorCard
        onRetry={() => {
          versions.refetch();
          cv.refetch();
        }}
      />
    );
  }

  const hasLocked = !!cv.data.locked.version;
  const pending = cv.data.relock.status === "pending";

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-8">
      <Link href={ROUTES.student.cv} className="text-maroon-600 text-sm font-semibold underline">
        Back to CV Builder
      </Link>
      <h1 className="font-display text-3xl font-bold">CV versions</h1>

      {versions.data.items.length === 0 ? (
        <EmptyState title="No versions yet" body="Your first upload becomes V1." />
      ) : (
        <ul className="space-y-3">
          {[...versions.data.items].reverse().map((v) => (
            <li key={v.id}>
              <Card className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="flex items-center gap-2 font-semibold">
                    {v.version}
                    {v.locked && <LockedVersionBadge version={v.version} />}
                    {v.current && !v.locked && <Badge tone="navy">Current</Badge>}
                  </p>
                  <p className="text-navy-400 text-xs">
                    {formatDay(v.createdAt)} · {v.note}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-display text-2xl font-bold">{v.score}</p>
                  {v.id === "draft" &&
                    (hasLocked ? (
                      pending ? (
                        <span role="status" className="text-sm font-semibold">
                          Re-lock requested
                        </span>
                      ) : (
                        <RelockDialog />
                      )
                    ) : (
                      <Button disabled={lock.isPending} onClick={() => lock.mutate("draft")}>
                        {lock.isPending ? "Locking…" : "Lock This Version"}
                      </Button>
                    ))}
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
