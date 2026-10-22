"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { ErrorCard } from "@/components/shared/ErrorCard";
import { PageSkeleton } from "@/components/shared/Skeletons";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils/cn";
import { notify } from "@/lib/utils/notify";
import { useLocalDraft } from "@/lib/utils/useLocalDraft";
import { useAnswer, usePatchAnswer } from "../hooks/useAnswers";
import type { AnswerDetail, AnswerParts } from "../schemas";

const FIELDS: { key: keyof AnswerParts; label: string; placeholder: string }[] = [
  {
    key: "situation",
    label: "Situation",
    placeholder: "What was the context? Keep it to two lines.",
  },
  {
    key: "decision",
    label: "Decision",
    placeholder: "What did you choose, and what did you give up?",
  },
  {
    key: "result",
    label: "Result",
    placeholder: "What changes for us if we hire you? End on that.",
  },
];

function parseStored(raw: string | null): AnswerParts | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as Partial<AnswerParts>;
    return {
      situation: String(v.situation ?? ""),
      decision: String(v.decision ?? ""),
      result: String(v.result ?? ""),
    };
  } catch {
    return null;
  }
}

function Editor({ answer, as: Heading }: { answer: AnswerDetail; as: "h1" | "h2" }) {
  const local = useLocalDraft(`prepco-answer-${answer.id}`);
  const stored = parseStored(local.stored);
  const [parts, setParts] = useState<AnswerParts>(stored ?? answer.parts);
  const patch = usePatchAnswer(answer.id);
  const dirty = FIELDS.some((f) => parts[f.key] !== answer.parts[f.key]);
  const restored = stored !== null && FIELDS.some((f) => stored[f.key] !== answer.parts[f.key]);
  const empty = FIELDS.every((f) => !parts[f.key].trim());
  const apiErr = patch.error instanceof ApiError ? patch.error : null;
  const flagged = answer.status === "flagged";

  const change = (key: keyof AnswerParts, value: string) => {
    const next = { ...parts, [key]: value };
    setParts(next);
    local.save(JSON.stringify(next));
  };
  const save = (message: string) =>
    patch.mutate(
      { parts },
      {
        onSuccess: () => {
          local.clear();
          notify(message);
        },
      },
    );

  return (
    <Card variant="feature" className="space-y-5 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span data-testid="answer-status">
          {flagged ? (
            <span className="bg-maroon-100 text-maroon-600 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold tracking-wider uppercase">
              <Flag className="size-3" aria-hidden />
              Flagged{answer.flaggedAt ? ` at ${answer.flaggedAt}` : ""}
            </span>
          ) : answer.status === "rehearsed" ? (
            <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-bold tracking-wider text-green-600 uppercase">
              Rehearsed
            </span>
          ) : (
            <span className="bg-cream-soft inline-flex items-center rounded-full px-3 py-1 text-xs font-bold tracking-wider uppercase">
              Not drafted
            </span>
          )}
        </span>
        <p className="text-navy-400 text-sm">
          {answer.draftNo > 0
            ? `Draft ${answer.draftNo}${answer.savedLabel ? ` · saved ${answer.savedLabel}` : ""}`
            : "No draft yet"}
        </p>
      </div>

      <Heading className="font-display text-2xl leading-tight font-bold md:text-[32px]">
        {answer.question}
      </Heading>

      {restored && (
        <p role="note" className="bg-cream-soft rounded-control p-2 text-xs">
          Restored your unsaved draft.
        </p>
      )}

      <div className="space-y-4">
        {FIELDS.map((f) => (
          <div key={f.key}>
            <label
              htmlFor={`${answer.id}-${f.key}`}
              className="mb-1.5 block text-[13px] font-bold tracking-[0.14em] uppercase"
            >
              {f.label}
            </label>
            <Textarea
              id={`${answer.id}-${f.key}`}
              value={parts[f.key]}
              placeholder={f.placeholder}
              onChange={(e) => change(f.key, e.target.value)}
              className="min-h-[88px] text-base"
            />
          </div>
        ))}
      </div>

      {flagged && answer.critique && (
        <div className="bg-maroon-100 rounded-card p-4">
          {answer.noteTags.length > 0 && (
            <ul aria-label="Parts the note is about" className="mb-3 flex flex-wrap gap-2">
              {answer.noteTags.map((t) => (
                <li
                  key={t}
                  className="text-navy-900 rounded-full bg-white px-3 py-1 text-xs font-bold tracking-wider uppercase"
                >
                  {t}
                </li>
              ))}
            </ul>
          )}
          <p className="text-maroon-600">
            <strong>Panel note:</strong> <span className="text-navy-900">{answer.critique}</span>
          </p>
        </div>
      )}

      <div className="flex items-start gap-3">
        <Switch
          label="Rehearse in my next panel"
          checked={answer.rehearseNext}
          onCheckedChange={(v) => patch.mutate({ rehearseNext: v })}
        />
        <div className="pt-2">
          <p className="font-semibold">Rehearse in my next panel</p>
          {answer.nextPanel && (
            <p className="text-navy-400 text-sm">
              {answer.nextPanel}. Your panelist will ask this one.
            </p>
          )}
        </div>
      </div>

      {patch.isError && (
        <p role="alert" className="text-maroon-600 text-sm">
          {apiErr?.message ?? "We could not save. Please try again."}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-end gap-3">
        {answer.status === "flagged" || answer.status === "rehearsed" ? (
          <Button
            variant="ghost"
            className="mr-auto"
            onClick={() =>
              patch.mutate({ status: answer.status === "flagged" ? "rehearsed" : "flagged" })
            }
          >
            {answer.status === "flagged" ? "Mark Rehearsed" : "Flag For Work"}
          </Button>
        ) : null}
        {dirty && (
          <Button
            variant="ghost"
            onClick={() => {
              setParts(answer.parts);
              local.clear();
            }}
          >
            Discard
          </Button>
        )}
        <Button
          variant="secondary"
          disabled={!dirty || patch.isPending}
          onClick={() => save("Draft saved")}
        >
          {patch.isPending ? "Saving…" : "Save draft"}
        </Button>
        <Button
          disabled={empty || patch.isPending}
          onClick={() => save("Sent for review. The note comes back before your next panel.")}
        >
          Send for review
        </Button>
      </div>
      <p className={cn("text-navy-400 text-right text-sm")}>Unlimited answer reviews on Premium.</p>
    </Card>
  );
}

/** The answer editor: question, the three parts, the panel note, the rehearse switch (s08.png). */
export function AnswerPanel({ id, as = "h2" }: { id: string; as?: "h1" | "h2" }) {
  const { data, isPending, isError, error, refetch } = useAnswer(id);
  if (isPending) return <PageSkeleton />;
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
  return <Editor key={`${data.id}-${data.draftNo}`} answer={data} as={as} />;
}
