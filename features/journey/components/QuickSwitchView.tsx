"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { ErrorCard } from "@/components/shared/ErrorCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { PageSkeleton, Skeleton } from "@/components/shared/Skeletons";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { ProposedBadge } from "@/components/shared/Badges";
import { FUNCTIONS } from "@/features/onboarding/schemas";
import { ROUTES } from "@/lib/config/routes";
import { cn } from "@/lib/utils/cn";
import { notify } from "@/lib/utils/notify";
import {
  useQuickSwitch,
  useQuickSwitchDigest,
  useSaveQuickSwitchPrefs,
  useToggleSavedListing,
} from "../hooks/useJourney";
import type { QuickSwitchPrefs } from "../schemas";

/** Compare two functions before changing target (kept from the first build; Proposed). */
function FunctionCompare() {
  const [to, setTo] = useState<string | null>(null);
  const q = useQuickSwitch(to);

  return (
    <section aria-labelledby="qs-compare" className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 id="qs-compare" className="font-display text-2xl font-bold">
          Thinking of a different function?
        </h2>
        <ProposedBadge />
      </div>
      <p className="text-navy-400 text-sm">
        See how much of your prep carries over. Nothing changes until you confirm.
      </p>

      <Card variant="feature">
        <FormField id="qs-to" label="Compare with">
          <select
            id="qs-to"
            value={to ?? ""}
            onChange={(e) => setTo(e.target.value || null)}
            className="rounded-control border-line min-h-11 w-full border bg-white px-3 text-sm"
          >
            <option value="">Select a function</option>
            {FUNCTIONS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </FormField>
      </Card>

      {to && q.isPending && <Skeleton className="h-40 w-full" />}
      {to && q.isError && <ErrorCard onRetry={() => q.refetch()} />}
      {q.data && to && (
        <Card variant="feature" data-testid="quick-switch-result">
          <p className="text-navy-400 text-xs font-semibold tracking-wider uppercase">
            {q.data.from} to {q.data.to}
          </p>
          <p className="font-display mt-1 text-4xl font-bold">
            {q.data.reusableAnswers}
            <span className="text-navy-400 text-xl font-normal">
              {" "}
              of {q.data.totalAnswers} answers carry over
            </span>
          </p>
          <ProgressBar
            className="mt-3"
            value={q.data.reusableAnswers}
            max={q.data.totalAnswers}
            label="Answers that carry over"
          />
          <p className="mt-3 text-sm">{q.data.cvBulletsToReframe} CV bullets to reframe.</p>
          {q.data.gaps.length > 0 && (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
              {q.data.gaps.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          )}
          <Button asChild className="mt-5">
            <Link href={ROUTES.student.profileChangeTarget}>Continue To Change Target</Link>
          </Button>
        </Card>
      )}
    </section>
  );
}

function Preferences({ prefs }: { prefs: QuickSwitchPrefs }) {
  const save = useSaveQuickSwitchPrefs();
  const [form, setForm] = useState(prefs);
  const set = <K extends keyof QuickSwitchPrefs>(k: K, v: QuickSwitchPrefs[K]) =>
    setForm((f) => ({ ...f, [k]: v }));
  const fitOk = Number.isFinite(form.minFit) && form.minFit >= 0 && form.minFit <= 100;

  return (
    <Card variant="feature" className="space-y-4 md:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-maroon-600 text-[13px] font-semibold tracking-[0.16em] uppercase">
          Preferences
        </h2>
        <Switch
          label="Quick Switch agent on"
          checked={form.enabled}
          onCheckedChange={(v) => {
            set("enabled", v);
            save.mutate({ ...form, enabled: v });
          }}
        />
      </div>
      <FormField id="qs-roles" label="Roles">
        <Input id="qs-roles" value={form.roles} onChange={(e) => set("roles", e.target.value)} />
      </FormField>
      <FormField id="qs-locations" label="Locations">
        <Input
          id="qs-locations"
          value={form.locations}
          onChange={(e) => set("locations", e.target.value)}
        />
      </FormField>
      <FormField
        id="qs-fit"
        label="Only send matches with fit above"
        error={fitOk ? undefined : "Enter a number from 0 to 100."}
      >
        <Input
          id="qs-fit"
          type="number"
          min={0}
          max={100}
          value={Number.isFinite(form.minFit) ? form.minFit : ""}
          onChange={(e) => set("minFit", e.target.value === "" ? NaN : Number(e.target.value))}
        />
      </FormField>
      <FormField id="qs-email" label="Digest goes to">
        <Input
          id="qs-email"
          type="email"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
        />
      </FormField>
      <Button
        className="w-full"
        disabled={!fitOk || save.isPending}
        onClick={() =>
          void save
            .mutateAsync(form)
            .then(() => notify("Preferences saved"))
            .catch(() => undefined)
        }
      >
        {save.isPending ? "Saving…" : "Save preferences"}
      </Button>
    </Card>
  );
}

/** S13 Quick Switch: the job-hunting agent (s13.png), with the function comparison below. */
export function QuickSwitchView() {
  const digest = useQuickSwitchDigest();
  const toggle = useToggleSavedListing();
  if (digest.isPending) return <PageSkeleton />;
  if (digest.isError || !digest.data) return <ErrorCard onRetry={() => digest.refetch()} />;
  const d = digest.data;
  const live = d.prefs.enabled;

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
      <PageHeader
        eyebrow="Quick Switch"
        pill={
          <span className="flex items-center gap-2">
            <Badge tone="goldSoft">For route four</Badge>
            <Badge tone={live ? "green" : "neutral"}>{live ? "● Live" : "Paused"}</Badge>
          </span>
        }
        pillClassName="bg-transparent p-0"
        title="An agent that job-hunts while you don't."
        subtitle="It scans job platforms every day and emails you only live openings, never older than 7 days. Free, and on for as long as you're looking."
      />

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Matches found", value: String(d.stats.matches), tone: "" },
          { label: "High fit", value: String(d.stats.highFit), tone: "green" },
          { label: "Job boards scanned", value: d.stats.boards, tone: "" },
          { label: "Oldest listing shown", value: d.stats.oldest, tone: "" },
        ].map((s) => (
          <Card key={s.label} className="p-5">
            <dt className="text-navy-400 text-sm">{s.label}</dt>
            <dd
              className={cn(
                "font-display mt-1 text-4xl font-bold",
                s.tone === "green" && "text-green-600",
              )}
            >
              {s.value}
            </dd>
          </Card>
        ))}
      </dl>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section aria-labelledby="digest" className="space-y-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="digest" className="font-display text-2xl font-bold">
              Today&apos;s digest · {d.items.length} new{" "}
              {d.items.length === 1 ? "match" : "matches"}
            </h2>
            <p className="text-navy-400 text-sm">{d.date} · also sent to your inbox</p>
          </div>
          {!live ? (
            <Card className="text-navy-400">
              The agent is paused. Switch it on in Preferences to get the daily digest again.
            </Card>
          ) : d.items.length === 0 ? (
            <Card className="text-navy-400">
              Nothing above fit {d.prefs.minFit} today. Lower the fit in Preferences to see more.
            </Card>
          ) : (
            <ul className="space-y-3">
              {d.items.map((l) => (
                <li key={l.id}>
                  <Card className="flex flex-wrap items-center gap-4">
                    <span
                      aria-hidden
                      className="font-display flex size-16 shrink-0 flex-col items-center justify-center rounded-full bg-green-100 text-green-600"
                    >
                      <span className="text-2xl leading-none font-bold">{l.fit}</span>
                      <span className="font-sans text-[10px] font-bold tracking-wider">FIT</span>
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{l.title}</p>
                      <p className="text-navy-400 text-sm">{l.meta}</p>
                      <p className="sr-only">Fit score {l.fit}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        aria-pressed={l.saved}
                        aria-label={`${l.saved ? "Saved" : "Save"} ${l.title}`}
                        disabled={toggle.isPending}
                        onClick={() => toggle.mutate(l.id)}
                      >
                        {l.saved ? "Saved" : "Save"}
                      </Button>
                      <Button
                        aria-label={`View listing ${l.title}`}
                        onClick={() => notify("Listings open once the job boards are connected")}
                      >
                        View listing
                      </Button>
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          )}
          <p className="text-navy-400 text-sm">
            Matched on your skills, experience and preferences. Your locked CV goes with every
            application.
          </p>
        </section>
        <Preferences key={JSON.stringify(d.prefs)} prefs={d.prefs} />
      </div>

      <FunctionCompare />
    </div>
  );
}
