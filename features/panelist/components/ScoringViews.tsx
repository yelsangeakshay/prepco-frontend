"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorCard } from "@/components/shared/ErrorCard";
import { PageSkeleton } from "@/components/shared/Skeletons";
import { ListPageSkeleton } from "@/components/shared/PageSkeletons";
import { ApiError } from "@/lib/api/client";
import { ROUTES } from "@/lib/config/routes";
import { useLocalDraft } from "@/lib/utils/useLocalDraft";
import type { QuestionInput, ScoringValues } from "../scoring/components/ScoringForm";
import { ScoringFormLazy } from "./lazy";
import { useBrief, useScoringList, useSubmitScore } from "../hooks/usePanelist";
import { PanelRow } from "./PanelRow";
import type { PanelItem } from "../schemas";

const SENT_SHOWN = 5;

/** The latest few sent panels; the rest open with "Show all". A link to #<sessionId> opens the list first. */
function SentList({ items }: { items: PanelItem[] }) {
  const [expanded, setExpanded] = useState(false);
  const firstExtra = useRef<HTMLDivElement>(null);
  const visible = expanded ? items : items.slice(0, SENT_SHOWN);
  const hidden = items.length - visible.length;

  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id && items.slice(SENT_SHOWN).some((i) => i.sessionId === id)) setExpanded(true);
  }, [items]);

  return (
    <>
      <div className="space-y-2">
        {visible.map((i, n) => (
          <div key={i.sessionId} id={i.sessionId} ref={n === SENT_SHOWN ? firstExtra : undefined}>
            <PanelRow item={i} compact />
          </div>
        ))}
      </div>
      {items.length > SENT_SHOWN && (
        <Button
          variant="ghost"
          aria-expanded={expanded}
          onClick={() => {
            setExpanded(!expanded);
            if (!expanded)
              requestAnimationFrame(() => firstExtra.current?.querySelector("a")?.focus());
          }}
        >
          {expanded ? "Show fewer" : `Show all ${items.length} (${hidden} more)`}
        </Button>
      )}
    </>
  );
}

/** P4 list. */
export function ScoringList() {
  const { data, isPending, isError, refetch } = useScoringList();
  if (isPending) return <ListPageSkeleton />;
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
          <SentList items={data.done} />
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
  const [initialDraft] = useState(draft.stored);
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
              <Link href={ROUTES.panelist.today}>Back to today</Link>
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
    restored = initialDraft ? (JSON.parse(initialDraft) as Partial<ScoringValues>) : undefined;
  } catch {
    restored = undefined;
  }

  const b = brief.data;
  const questions: QuestionInput[] = [
    { text: "Walk me through your profile." },
    { text: `Why ${b.student.target}?` },
    ...b.answersToProbe.map((a) => ({
      text: a.question,
      tag: a.status === "flagged" ? "Flagged at P1" : "Not drafted in the builder",
      p1Note: a.why,
    })),
    { text: "Your own question" },
  ];

  return (
    <ScoringFormLazy
      questions={questions}
      p1Readiness={b.student.readiness}
      eyebrow={`${b.title.slice(0, 2)} · Live · ${b.student.name}`}
      briefHref={ROUTES.panelist.brief(sessionId)}
      defaultValues={restored}
      restored={!!restored}
      submitting={submit.isPending}
      error={
        submit.isError
          ? (err?.message ?? "We could not send your feedback. Please try again.")
          : null
      }
      onChange={onChange}
      onSubmit={(body) => submit.mutate(body, { onSuccess: () => draft.clear() })}
    />
  );
}
