"use client";

import { useState } from "react";
import Link from "next/link";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorCard } from "@/components/shared/ErrorCard";
import { FlaggedBadge, NotDraftedBadge, RehearsedBadge } from "@/components/shared/Badges";
import { LazyRichTextEditor } from "@/components/shared/LazyRichTextEditor";
import { PageSkeleton } from "@/components/shared/Skeletons";
import { ApiError } from "@/lib/api/client";
import { ROUTES } from "@/lib/config/routes";
import { notify } from "@/lib/utils/notify";
import { useLocalDraft } from "@/lib/utils/useLocalDraft";
import { useAnswer, usePatchAnswer } from "../hooks/useAnswers";
import type { AnswerDetail } from "../schemas";

function Editor({ answer }: { answer: AnswerDetail }) {
  const local = useLocalDraft(`prepco-answer-${answer.id}`);
  const [text, setText] = useState(local.stored ?? answer.draft);
  const patch = usePatchAnswer(answer.id);
  const dirty = text !== answer.draft;
  const restored = local.stored !== null && local.stored !== answer.draft;
  const apiErr = patch.error instanceof ApiError ? patch.error : null;

  return (
    <Card variant="feature" className="space-y-3">
      <h2 className="font-display text-xl font-bold">Your answer</h2>
      {restored && (
        <p role="note" className="bg-cream-soft rounded-control p-2 text-xs">
          Restored your unsaved draft.
        </p>
      )}
      <LazyRichTextEditor
        value={text}
        onChange={(t) => {
          setText(t);
          local.save(t);
        }}
        label="Answer draft"
        placeholder="Write your answer"
        minHeight={160}
      />
      {answer.inlineCritique.length > 0 && (
        <ul aria-label="Inline critique" className="space-y-2">
          {answer.inlineCritique.map((c) => (
            <li key={c.quote} className="bg-maroon-100 rounded-control p-3 text-sm">
              <q className="font-display">{c.quote}</q>
              <span className="text-maroon-600 mt-1 block font-semibold">{c.note}</span>
            </li>
          ))}
        </ul>
      )}
      {patch.isError && (
        <p role="alert" className="text-maroon-600 text-sm">
          {apiErr?.message ?? "We could not save. Please try again."}
        </p>
      )}
      <div className="flex gap-2">
        <Button
          disabled={!dirty || patch.isPending}
          onClick={() =>
            patch.mutate(
              { draft: text },
              {
                onSuccess: () => {
                  local.clear();
                  notify("Answer saved");
                },
              },
            )
          }
        >
          {patch.isPending ? "Saving…" : "Save Answer"}
        </Button>
        {dirty && (
          <Button
            variant="ghost"
            onClick={() => {
              setText(answer.draft);
              local.clear();
            }}
          >
            Discard
          </Button>
        )}
      </div>
    </Card>
  );
}

/** S8 detail: draft, inline critique, optimistic flag / rehearsed. */
export function AnswerDetailView({ id }: { id: string }) {
  const { data, isLoading, isError, error, refetch } = useAnswer(id);
  const patch = usePatchAnswer(id);

  if (isLoading) return <PageSkeleton />;
  if (isError || !data) {
    const notFound = error instanceof ApiError && error.status === 404;
    return (
      <ErrorCard
        title={notFound ? "Answer not found" : undefined}
        message={notFound ? "That answer does not exist." : undefined}
        onRetry={notFound ? undefined : () => refetch()}
      />
    );
  }

  const statusErr = patch.error instanceof ApiError ? patch.error : null;

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-8">
      <Link
        href={ROUTES.student.answers}
        className="text-maroon-600 text-sm font-semibold underline"
      >
        All answers
      </Link>
      <div className="space-y-2">
        <p className="text-navy-400 text-xs font-semibold tracking-wider uppercase">
          {data.category}
        </p>
        <h1 className="font-display text-2xl font-bold md:text-3xl">{data.question}</h1>
        <div className="flex flex-wrap items-center gap-3">
          <span data-testid="answer-status">
            {data.status === "rehearsed" && <RehearsedBadge />}
            {data.status === "flagged" && <FlaggedBadge />}
            {data.status === "not-drafted" && <NotDraftedBadge />}
          </span>
          {data.status === "flagged" ? (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => patch.mutate({ status: "rehearsed" })}
            >
              Mark Rehearsed
            </Button>
          ) : data.status === "rehearsed" ? (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => patch.mutate({ status: "flagged" })}
            >
              <Flag className="size-4" aria-hidden /> Flag For Work
            </Button>
          ) : null}
        </div>
        {data.critique && (
          <p className="bg-maroon-100 text-maroon-600 rounded-card p-3 text-sm">{data.critique}</p>
        )}
        {statusErr && (
          <p role="alert" className="text-maroon-600 text-sm">
            {statusErr.message}
          </p>
        )}
      </div>
      <Editor key={`${data.id}-${data.draft.length}`} answer={data} />
    </div>
  );
}
