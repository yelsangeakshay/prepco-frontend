"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorCard } from "@/components/shared/ErrorCard";
import { PageSkeleton } from "@/components/shared/Skeletons";
import { ROUTES } from "@/lib/config/routes";
import { formatDay } from "@/lib/utils/dates";
import { useProfile } from "../hooks/useProfile";
import { ProfileDetailsFormLazy } from "./lazy";

const initials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

/** S15 profile (s15.png). */
export function ProfileView() {
  const { data, isPending, isError, refetch } = useProfile();
  if (isPending) return <PageSkeleton />;
  if (isError || !data) return <ErrorCard onRetry={() => refetch()} />;

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-4 md:p-8">
      <header className="flex flex-wrap items-center justify-between gap-4 md:pr-72">
        <div className="flex items-center gap-4">
          <span
            aria-hidden
            className="bg-maroon-600 flex size-14 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white md:size-[62px] md:text-xl"
          >
            {initials(data.name)}
          </span>
          <div>
            <p className="text-maroon-600 text-[13px] font-semibold tracking-[0.16em] uppercase">
              Profile
            </p>
            <h1 className="font-display text-3xl leading-tight font-bold md:text-[40px]">
              {data.name}
            </h1>
            <p className="text-navy-400">
              {data.college} · {data.batch} · {data.track.toLowerCase()} track
            </p>
          </div>
        </div>
        <Button type="submit" form="profile-form">
          Save changes
        </Button>
      </header>

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

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card variant="feature" className="md:p-8">
          <ProfileDetailsFormLazy profile={data} />
        </Card>

        <Card variant="feature" className="space-y-4">
          <div>
            <h2 className="text-maroon-600 text-[13px] font-semibold tracking-[0.16em] uppercase">
              What your panel can see
            </h2>
            <p className="text-navy-400 mt-2">
              Shared with the specialists assigned to you. This is what makes the panel at P3 better
              than the one at P1.
            </p>
          </div>
          <ul>
            {data.panelSees.map((r) => (
              <li
                key={r.id}
                className="border-line flex items-center justify-between gap-3 border-t py-3 first:border-t-0"
              >
                <div>
                  <p className="font-semibold">{r.label}</p>
                  <p className="text-navy-400 text-sm">{r.detail}</p>
                </div>
                <Badge tone="green" className="shrink-0">
                  Shared
                </Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card variant="navy" className="p-6 md:p-8">
        <p className="text-gold-300 text-[13px] font-semibold tracking-[0.16em] uppercase">
          Nothing gets reset
        </p>
        <p className="font-display mt-3 max-w-3xl text-2xl leading-snug md:text-[28px]">
          Your CV keeps its version history, your answer bank stays as you left it, and the panel
          that sees you in finals can read what you said in your first profiling call.
        </p>
      </Card>
    </div>
  );
}
