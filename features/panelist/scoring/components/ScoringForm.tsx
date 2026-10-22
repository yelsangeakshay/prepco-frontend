"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label, Textarea } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils/cn";

export const LANDED = ["Situation", "Decision", "Result"] as const;
export const ANSWER_VERDICTS = ["Strong", "Okay", "Needs work"] as const;

export interface QuestionInput {
  text: string;
  /** Where the student's answer stands, shown as a pill (p04: "Flagged at P1"). */
  tag?: string;
  /** What the last panel wrote about this question. */
  p1Note?: string;
}

export interface QuestionScore {
  landed: Record<(typeof LANDED)[number], boolean>;
  verdict: (typeof ANSWER_VERDICTS)[number] | null;
  note: string;
  sendBack: boolean;
}

export interface ScoringValues {
  answers: QuestionScore[];
  /** The panelist's read of the student after this panel, 0 to 100. */
  readiness: number;
}

/** The body the scores endpoint takes (Structure, Defensibility, Composure, verdict, note, send-back). */
export interface ScoreSubmission {
  scores: { Structure: number; Defensibility: number; Composure: number };
  verdict: "Ready" | "Almost There" | "Needs Work";
  note: string;
  sendBack: boolean;
}

export const emptyQuestion = (): QuestionScore => ({
  landed: { Situation: false, Decision: false, Result: false },
  verdict: null,
  note: "",
  sendBack: false,
});

const POINTS = { Strong: 5, Okay: 3, "Needs work": 1 } as const;
const clamp = (n: number) => Math.max(1, Math.min(5, Math.round(n)));

/**
 * Turns the per-question marks into the three scores the API stores. Proposed: p04 draws the
 * per-question fields and the readiness slider but not how they map to the stored scores.
 */
export function toSubmission(
  values: ScoringValues,
): { ok: true; body: ScoreSubmission } | { ok: false; error: string } {
  const scored = values.answers.filter((a) => a.verdict);
  if (scored.length === 0) return { ok: false, error: "Mark at least one question first." };
  const note = values.answers
    .map((a) => a.note.trim())
    .filter(Boolean)
    .join(" ");
  if (note.length < 20) {
    return { ok: false, error: "Write at least 20 characters of feedback across your notes." };
  }
  const avg = (f: (a: QuestionScore) => number) =>
    scored.reduce((sum, a) => sum + f(a), 0) / scored.length;
  const landed = (a: QuestionScore) => LANDED.filter((l) => a.landed[l]).length;
  const r = values.readiness;
  return {
    ok: true,
    body: {
      scores: {
        Structure: clamp(1 + (4 * avg(landed)) / LANDED.length),
        Defensibility: clamp(avg((a) => POINTS[a.verdict!])),
        Composure: clamp(r / 20),
      },
      verdict: r >= 75 ? "Ready" : r >= 60 ? "Almost There" : "Needs Work",
      note,
      sendBack: values.answers.some((a) => a.sendBack),
    },
  };
}

interface Props {
  questions: QuestionInput[];
  /** The readiness the last panel gave, shown beside the slider. */
  p1Readiness: number;
  /** "P2 · Live · Riya Kulkarni" */
  eyebrow: string;
  briefHref: string;
  defaultValues?: Partial<ScoringValues>;
  /** Called on every change, so the caller can persist a local draft. */
  onChange?: (values: ScoringValues) => void;
  submitting?: boolean;
  /** True when the values came back from an unsent local draft. */
  restored?: boolean;
  /** Shown above the buttons, e.g. a failed send. */
  error?: string | null;
  onSubmit: (body: ScoreSubmission) => void;
}

/** P4 live scoring (p04): the questions down the left, one question at a time, and the overall read. */
export function ScoringForm({
  questions,
  p1Readiness,
  eyebrow,
  briefHref,
  defaultValues,
  onChange,
  submitting,
  restored,
  error,
  onSubmit,
}: Props) {
  const [values, setValues] = useState<ScoringValues>(() => ({
    answers: questions.map((_, i) => defaultValues?.answers?.[i] ?? emptyQuestion()),
    readiness: defaultValues?.readiness ?? p1Readiness,
  }));
  const [current, setCurrent] = useState(0);
  const [problem, setProblem] = useState<string | null>(null);

  // The first run only reports the starting values, which would be saved as a draft nobody wrote.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    onChange?.(values);
  }, [values, onChange]);

  const q = questions[current]!;
  const a = values.answers[current]!;
  const patch = (next: Partial<QuestionScore>) =>
    setValues((v) => ({
      ...v,
      answers: v.answers.map((x, i) => (i === current ? { ...x, ...next } : x)),
    }));

  const submit = () => {
    const r = toSubmission(values);
    setProblem(r.ok ? null : r.error);
    if (r.ok) onSubmit(r.body);
  };

  return (
    <div className="mx-auto max-w-[1280px] space-y-5 p-4 md:p-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-maroon-600 flex flex-wrap items-center gap-3 text-xs font-semibold tracking-[0.16em] uppercase">
            {eyebrow}
            <span className="bg-maroon-100 rounded-full px-3 py-1 text-xs">
              <span aria-hidden>● </span>Live
            </span>
          </p>
          <h1 className="font-display mt-1 text-3xl font-bold md:text-[44px]">
            Question {current + 1} of {questions.length}
          </h1>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="secondary">
            <Link href={briefHref}>Back to brief</Link>
          </Button>
          <Button onClick={submit} loading={submitting}>
            Submit feedback
          </Button>
        </div>
      </header>
      {restored && (
        <p role="note" className="bg-cream-soft rounded-control p-2 text-xs">
          Restored your unsent draft.
        </p>
      )}
      {(problem || error) && (
        <p role="alert" className="text-maroon-600 text-sm font-semibold">
          {problem ?? error}
        </p>
      )}

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)_minmax(0,290px)] lg:gap-6">
        <Card variant="feature" className="h-fit p-3 md:p-4">
          <ol className="flex gap-2 overflow-x-auto lg:flex-col lg:gap-1 lg:overflow-visible">
            {questions.map((item, i) => {
              const done = values.answers[i]!.verdict !== null;
              const active = i === current;
              return (
                <li key={item.text} className="shrink-0">
                  <button
                    type="button"
                    aria-current={active ? "step" : undefined}
                    onClick={() => setCurrent(i)}
                    className={cn(
                      "rounded-control flex min-h-11 w-full items-start gap-3 p-2 text-left lg:p-3",
                      active && "bg-maroon-100 text-maroon-600 font-semibold",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                        done
                          ? "bg-green-600 text-white"
                          : active
                            ? "bg-maroon-600 text-white"
                            : "bg-cream-soft text-navy-900",
                      )}
                    >
                      {done ? <Check className="size-4" aria-hidden /> : i + 1}
                    </span>
                    <span className="sr-only lg:not-sr-only">{item.text}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </Card>

        <Card variant="feature" className="p-5 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {q.tag ? (
              <span className="bg-maroon-100 text-maroon-600 rounded-full px-3 py-1 text-xs font-bold tracking-wider uppercase">
                {q.tag}
              </span>
            ) : (
              <span />
            )}
            <span className="text-navy-400 text-sm">Fields below are a proposal</span>
          </div>
          <h2 className="font-display mt-4 text-2xl leading-snug font-bold md:text-[30px]">
            {q.text}
          </h2>

          <fieldset className="mt-6">
            <legend className="text-navy-900 mb-2 text-xs font-semibold tracking-[0.16em] uppercase">
              What landed
            </legend>
            <div className="flex flex-wrap gap-3">
              {LANDED.map((l) => (
                <label
                  key={l}
                  className="border-line rounded-control flex min-h-11 cursor-pointer items-center gap-3 border bg-white px-4 text-base font-medium"
                >
                  <input
                    type="checkbox"
                    checked={a.landed[l]}
                    onChange={(e) => patch({ landed: { ...a.landed, [l]: e.target.checked } })}
                    className="accent-maroon-600 size-4"
                  />
                  {l}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-6">
            <legend className="text-navy-900 mb-2 text-xs font-semibold tracking-[0.16em] uppercase">
              Verdict
            </legend>
            <div role="radiogroup" aria-label="Verdict" className="flex flex-wrap gap-3">
              {ANSWER_VERDICTS.map((v) => (
                <button
                  key={v}
                  type="button"
                  role="radio"
                  aria-checked={a.verdict === v}
                  onClick={() => patch({ verdict: v })}
                  className={cn(
                    "rounded-control min-h-11 border px-5 text-base font-semibold",
                    a.verdict === v
                      ? "border-maroon-600 bg-maroon-600 text-white"
                      : "border-line bg-white",
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="mt-6">
            <Label
              htmlFor="q-note"
              className="text-navy-900 text-xs font-semibold tracking-[0.16em] uppercase"
            >
              Note to the student
            </Label>
            <Textarea
              id="q-note"
              rows={4}
              value={a.note}
              onChange={(e) => patch({ note: e.target.value })}
            />
          </div>

          <div className="mt-5 flex items-center gap-3">
            <Switch
              id="sendBack"
              label="Send back to the student's builder"
              checked={a.sendBack}
              onCheckedChange={(sendBack) => patch({ sendBack })}
            />
            <div>
              <Label htmlFor="sendBack" className="mb-0 font-semibold">
                Send back to the student&apos;s builder
              </Label>
              <p className="text-navy-400 text-sm">It reappears as Flagged with your note.</p>
            </div>
          </div>

          <div className="mt-6 flex justify-between gap-3">
            <Button
              type="button"
              variant="secondary"
              disabled={current === 0}
              onClick={() => setCurrent(current - 1)}
            >
              ← Previous
            </Button>
            <Button
              type="button"
              disabled={current === questions.length - 1}
              onClick={() => setCurrent(current + 1)}
            >
              Next question →
            </Button>
          </div>
        </Card>

        <div className="space-y-4">
          <Card variant="feature">
            <p className="text-maroon-600 text-xs font-semibold tracking-[0.16em] uppercase">
              Ready for Day 0
            </p>
            <div className="mt-4 flex items-end justify-between">
              <span className="text-navy-400 text-sm">P1: {p1Readiness}%</span>
              <span className="font-num text-4xl font-bold" aria-live="polite">
                {values.readiness}%
              </span>
            </div>
            <label htmlFor="readiness" className="text-navy-400 mt-2 block text-sm">
              Your read after this panel
            </label>
            <input
              id="readiness"
              type="range"
              min={0}
              max={100}
              value={values.readiness}
              onChange={(e) => setValues((v) => ({ ...v, readiness: Number(e.target.value) }))}
              className="accent-maroon-600 mt-2 h-6 w-full"
            />
          </Card>
          {q.p1Note && (
            <div className="bg-cream-soft rounded-2xl p-6">
              <p className="text-maroon-600 text-xs font-semibold tracking-[0.16em] uppercase">
                P1 note on this question
              </p>
              <p className="mt-2 text-base">{q.p1Note}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
