"use client";

import { Card } from "@/components/ui/card";
import { ErrorCard } from "@/components/shared/ErrorCard";
import { PageSkeleton } from "@/components/shared/Skeletons";
import { ProposedBadge } from "@/components/shared/Badges";
import { usePanelistProfile } from "../hooks/usePanelist";
import { PanelistProfileFormLazy } from "./lazy";

/** Not mocked: built from the student profile (S15) patterns. */
export function PanelistProfileView() {
  const { data, isPending, isError, refetch } = usePanelistProfile();
  if (isPending) return <PageSkeleton />;
  if (isError || !data) return <ErrorCard onRetry={() => refetch()} />;
  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-8">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="font-display text-3xl font-bold">Profile</h1>
        <ProposedBadge />
      </div>
      <Card variant="feature">
        <p className="text-navy-400 text-xs font-semibold tracking-wider uppercase">Panels</p>
        <p className="font-display mt-1 text-2xl font-bold">{data.specialty}</p>
        <p className="text-sm">{data.function}</p>
        <p className="text-navy-400 mt-1 text-xs">{data.email}</p>
      </Card>
      <Card variant="feature">
        <h2 className="font-display mb-4 text-xl font-bold">Your details</h2>
        <PanelistProfileFormLazy profile={data} />
      </Card>
    </div>
  );
}
