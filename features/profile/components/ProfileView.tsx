"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorCard } from "@/components/shared/ErrorCard";
import { PageSkeleton } from "@/components/shared/Skeletons";
import { ROUTES } from "@/lib/config/routes";
import { formatDay } from "@/lib/utils/dates";
import { useProfile } from "../hooks/useProfile";
import { ProfileDetailsFormLazy } from "./lazy";

/** S15 profile. */
export function ProfileView() {
  const { data, isPending, isError, refetch } = useProfile();
  if (isPending) return <PageSkeleton />;
  if (isError || !data) return <ErrorCard onRetry={() => refetch()} />;

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-8">
      <h1 className="font-display text-3xl font-bold">Profile</h1>

      {data.targetChange && (
        <div
          role="note"
          data-testid="target-changed"
          className="bg-cream-soft border-gold-500 rounded-card border-l-4 p-4 text-sm"
        >
          <p className="font-semibold">
            Target changed on {formatDay(data.targetChange.changedAt)}
          </p>
          <p className="text-navy-400">
            From {data.targetChange.from}. {data.targetChange.answersToRework} answers need rework.{" "}
            <Link
              href={`${ROUTES.student.answers}?status=flagged`}
              className="text-maroon-600 font-semibold underline"
            >
              Open flagged answers
            </Link>
          </p>
        </div>
      )}

      <Card variant="feature">
        <p className="text-navy-400 text-xs font-semibold tracking-wider uppercase">Target</p>
        <p data-testid="target" className="font-display mt-1 text-2xl font-bold">
          {data.target.function}
        </p>
        <p className="text-sm">{data.target.role}</p>
        <p className="text-navy-400 mt-1 text-xs">
          {data.track} track · {data.background}
        </p>
        <Button asChild variant="secondary" className="mt-4">
          <Link href={ROUTES.student.profileChangeTarget}>Change Target</Link>
        </Button>
      </Card>

      <Card variant="feature">
        <h2 className="font-display mb-4 text-xl font-bold">Your details</h2>
        <p className="text-navy-400 mb-4 text-sm">{data.email}</p>
        <ProfileDetailsFormLazy profile={data} />
      </Card>
    </div>
  );
}
