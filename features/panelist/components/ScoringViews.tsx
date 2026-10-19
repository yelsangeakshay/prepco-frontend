"use client";

import { useCallback } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorCard } from "@/components/shared/ErrorCard";
import { ProposedBadge } from "@/components/shared/Badges";
import { PageSkeleton } from "@/components/shared/Skeletons";
import { ApiError } from "@/lib/api/client";
import { ROUTES } from "@/lib/config/routes";
import { useLocalDraft } from "@/lib/utils/useLocalDraft";
import type { ScoringValues } from "../scoring/components/ScoringForm";
import { ScoringFormLazy } from "./lazy";
import { useBrief, useScoringList, useSubmitScore } from "../hooks/usePanelist";
import { BriefBody } from "./BriefViews";
import { PanelRow } from "./PanelRow";

/** P4 list. */
export function ScoringList() {
  const { data, isPending, isError, refetch } = useScoringList();
  if (isPending) return <PageSkeleton />;
  if (isError || !data) return <ErrorCard onRetry={() => refetch()} />;
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-8">
      <h1 className="font-display text-3xl font-bold">Scoring & feedback</h1>
      <section aria-labelledby="await-h" className="space-y-3">
        <h2 id="await-h" className="font-display text-xl font-bold">
          To score
        </h2>
        {data.awaiting.length === 0 ? (
          <EmptyState title="Nothing to score" body="Finished panels show up here." />
        ) : (
          data.awaiting.map((i) => <PanelRow key={i.sessionId} item={i} />)
        )}
      </section>
      <section aria-labelledby="done-h" className="space-y-3">
        <h2 id="done-h" className="font-display text-xl font-bold">
          Sent
        </h2>
        {data.done.length === 0 ? (
          <EmptyState title="No feedback sent yet" />
        ) : (
          data.done.map((i) => <PanelRow key={i.sessionId} item={i} />)
        )}
      </section>
    </div>
  );
}

/** P4 live scoring: brief on the left, scoring form on the right; verdict, note and send-back switch. */
export function LiveScoring({ sessionId }: { sessionId: string }) {
  const brief = useBrief(sessionId);
  const submit = useSubmitScore(sessionId);
  const draft = useLocalDraft(`prepco-scoring-${sessionId}`);
  const saveDraft = draft.save;

  const onChange = useCallback((v: ScoringValues) => saveDraft(JSON.stringify(v)), [saveDraft]);

  if (brief.isPending) return <PageSkeleton />;
  if (brief.isError || !brief.data) {
    const notFound = brief.error instanceof ApiError && brief.error.status === 404;
    return (
      <ErrorCard
        title={notFound ? "Panel not found" : undefined}
        message={notFound ? "That panel is not assigned to you." : undefined}
        onRetry={notFound ? undefined : () => brief.refetch()}
      />
    );
  }

  const err = submit.error instanceof ApiError ? submit.error : null;

  if (submit.data) {
    return (
      <div className="mx-auto max-w-xl p-4 md:p-8">
        <Card variant="feature" data-testid="score-sent">
          <CheckCircle2 className="size-10 text-green-600" aria-hidden />
          <h1 className="font-display mt-3 text-2xl font-bold">Feedback sent</h1>
          <p className="text-navy-400 mt-1 text-sm">
            {brief.data.student.name} can read it now.
            {submit.data.sentBack && " They were sent back to the builders."}
          </p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Button asChild>
              <Link href={ROUTES.panelist.today}>Back To Today</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href={ROUTES.panelist.scoring}>Scoring & Feedback</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  let restored: Partial<ScoringValues> | undefined;
  try {
    restored = draft.stored ? (JSON.parse(draft.stored) as Partial<ScoringValues>) : undefined;
  } catch {
    restored = undefined;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4 md:p-8">
      <Link
        href={ROUTES.panelist.scoring}
        className="text-maroon-600 text-sm font-semibold underline"
      >
        Scoring & feedback
      </Link>
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="font-display text-3xl font-bold">Score: {brief.data.student.name}</h1>
        <ProposedBadge />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <BriefBody brief={brief.data} />
        <Card variant="feature" className="h-fit lg:sticky lg:top-20">
          <h2 className="font-display mb-4 text-xl font-bold">Your score</h2>
          {restored && (
            <p role="note" className="bg-cream-soft rounded-control mb-4 p-2 text-xs">
              Restored your unsent draft.
            </p>
          )}
          {submit.isError && (
            <p
              role="alert"
              className="bg-maroon-100 text-maroon-600 rounded-control mb-4 p-3 text-sm"
            >
              {err?.message ?? "We could not send your feedback. Please try again."}
            </p>
          )}
          <ScoringFormLazy
            defaultValues={restored}
            submitting={submit.isPending}
            onChange={onChange}
            onSubmit={(v) => submit.mutate(v, { onSuccess: () => draft.clear() })}
          />
        </Card>
      </div>
    </div>
  );
}
