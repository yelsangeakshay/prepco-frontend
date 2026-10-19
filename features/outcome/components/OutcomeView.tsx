"use client";

import { useState } from "react";
import Link from "next/link";
import { PartyPopper, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorCard } from "@/components/shared/ErrorCard";
import { ProposedBadge } from "@/components/shared/Badges";
import { PageSkeleton } from "@/components/shared/Skeletons";
import { ROUTES } from "@/lib/config/routes";
import { formatINR } from "@/lib/utils/currency";
import { useOutcome, usePostOutcome } from "../hooks/useOutcome";
import { PlacedFormLazy } from "./lazy";

/** E7 report outcome; E11 the placed and not-placed result states. */
export function OutcomeView() {
  const { data, isPending, isError, refetch } = useOutcome();
  const post = usePostOutcome();
  const [mode, setMode] = useState<"choose" | "placed">("choose");

  if (isPending) return <PageSkeleton />;
  if (isError || !data) return <ErrorCard onRetry={() => refetch()} />;

  const shell = (children: React.ReactNode) => (
    <div className="mx-auto max-w-xl space-y-4 p-4 md:p-8">{children}</div>
  );

  if (data.state === "placed") {
    return shell(
      <Card variant="feature" data-testid="outcome-placed">
        <PartyPopper className="text-gold-500 size-10" aria-hidden />
        <h1 className="font-display mt-3 text-3xl font-bold">Congratulations, Riya</h1>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-navy-400">Company</dt>
            <dd className="font-semibold">{data.company}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-navy-400">Role</dt>
            <dd className="font-semibold">{data.role}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-navy-400">CTC</dt>
            <dd className="font-semibold">{data.ctc ? formatINR(data.ctc) : "—"}</dd>
          </div>
        </dl>
        <Button asChild variant="secondary" className="mt-5">
          <Link href={ROUTES.student.home}>Back To Home</Link>
        </Button>
      </Card>,
    );
  }

  if (data.state === "not-placed") {
    return shell(
      <Card variant="feature" data-testid="outcome-not-placed">
        <HeartHandshake className="text-maroon-600 size-10" aria-hidden />
        <h1 className="font-display mt-3 text-3xl font-bold">Your credit is carried over</h1>
        <p className="text-navy-400 mt-2 text-sm">
          We are sorry it did not work out this season.{" "}
          {data.creditCarried ? (
            <>
              <strong className="text-navy-900">{formatINR(data.creditCarried)}</strong> moves to
              your next season in full.
            </>
          ) : null}
        </p>
        <p className="mt-3 flex items-center gap-2 text-xs">
          <ProposedBadge />
          <span className="text-navy-400">Full credit for students not placed.</span>
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Button asChild>
            <Link href={ROUTES.student.billing}>See Plan & Billing</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href={ROUTES.student.home}>Back To Home</Link>
          </Button>
        </div>
      </Card>,
    );
  }

  return shell(
    <>
      <h1 className="font-display text-3xl font-bold">How did Day 0 go?</h1>
      <p className="text-navy-400 text-sm">
        Day 0 is {data.day0Label}. Tell us the outcome so we can close your season.
      </p>
      <Card variant="feature">
        {mode === "choose" ? (
          <div className="flex flex-col gap-2">
            <Button onClick={() => setMode("placed")}>I Got Placed</Button>
            <Button
              variant="secondary"
              disabled={post.isPending}
              onClick={() => post.mutate({ state: "not-placed" })}
            >
              {post.isPending ? "Saving…" : "I Was Not Placed"}
            </Button>
          </div>
        ) : (
          <PlacedFormLazy onDone={(v) => post.mutate({ state: "placed", ...v })} />
        )}
        {post.isError && (
          <p role="alert" className="text-maroon-600 mt-3 text-sm">
            We could not save your outcome. Please try again.
          </p>
        )}
      </Card>
    </>,
  );
}
