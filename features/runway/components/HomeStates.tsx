"use client";

import Link from "next/link";
import { useNavigate } from "@/lib/nav/useNavigate";
import { useState } from "react";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { ROUTES } from "@/lib/config/routes";
import { cn } from "@/lib/utils/cn";
import { formatINR } from "@/lib/utils/currency";
import type { Runway } from "../schemas";

const eyebrow = "text-maroon-600 text-[13px] font-semibold tracking-[0.16em] uppercase";
const firstName = (r: Runway) => r.student.name.split(" ")[0];

const WAITING = [
  ["Runway", "Your eight-week runway appears here after you pick a plan."],
  ["Answer bank", "Questions built from your locked CV unlock with Basic."],
  ["Panel feedback", "Every panel's notes land here, and your next panel reads them."],
] as const;

/** Home on the first login, nothing booked yet (e12.png): three steps, two done. */
export function FirstLoginHome({ data }: { data: Runway }) {
  const target = data.student.target.split(" (")[0];
  const rows = [
    {
      title: "Tell us your track and target",
      detail: `${data.student.track} · ${target} · Day 0 ${data.day0.label}`,
    },
    {
      title: "Upload your current CV",
      detail: `Read as ${data.cv.version} · first score ${data.cv.score}`,
    },
  ];
  return (
    <div className="mx-auto max-w-[1440px] space-y-6 p-4 md:p-8 xl:px-10">
      <PageHeader
        title={`Welcome, ${firstName(data)}. Three steps before anything costs money.`}
        className="md:pr-72"
      />
      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card variant="feature" className="p-4 md:p-6">
          <ol>
            {rows.map((r) => (
              <li
                key={r.title}
                className="border-line flex items-center gap-4 border-b py-4 first:pt-0"
              >
                <span
                  aria-hidden
                  className="flex size-10 shrink-0 items-center justify-center rounded-full bg-green-600 text-white"
                >
                  <Check className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{r.title}</p>
                  <p className="text-navy-400">{r.detail}</p>
                </div>
                <Badge tone="green">Done</Badge>
              </li>
            ))}
            <li className="flex flex-col gap-4 pt-4 pb-1 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <span
                  aria-hidden
                  className="bg-maroon-600 flex size-10 shrink-0 items-center justify-center rounded-full font-bold text-white"
                >
                  3
                </span>
                <div className="min-w-0">
                  <p className="font-semibold">Book your free 30-minute session</p>
                  <p className="text-navy-400">
                    CV markup, two practice answers, three roles you&apos;re competitive for. No
                    card.
                  </p>
                </div>
              </div>
              <Button asChild className="shrink-0">
                <Link href={ROUTES.student.freeSession}>Pick your slot</Link>
              </Button>
            </li>
          </ol>
        </Card>
        <Card variant="navy" className="space-y-3 p-6">
          <p className="text-gold-300 text-[13px] font-semibold tracking-[0.16em] uppercase">
            While you wait
          </p>
          <p className="text-lg leading-snug">
            The CV Builder is free. Fix two bullets before your session and we&apos;ll spend the 30
            minutes on harder things.
          </p>
          <Button asChild variant="onNavy" className="w-full">
            <Link href={ROUTES.student.cv}>Open CV Builder</Link>
          </Button>
        </Card>
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 md:grid-cols-3">
        {WAITING.map(([title, body]) => (
          <div
            key={title}
            className="rounded-feature border-line text-navy-400 border-2 border-dashed p-6"
          >
            <p className="text-sm font-semibold tracking-[0.14em] uppercase">{title}</p>
            <p className="mt-4 text-lg leading-snug">{body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Home for a returning student starting a second season (e11.png). */
export function SecondSeasonHome({ data }: { data: Runway }) {
  const { navigate } = useNavigate();
  const season = data.secondSeason!;
  const [planId, setPlanId] = useState(season.plans.find((p) => p.suggested)?.id ?? "premium");
  const chosen = season.plans.find((p) => p.id === planId);
  return (
    <div className="mx-auto max-w-[1440px] space-y-6 p-4 md:p-8 xl:px-10">
      <PageHeader
        title="Welcome back. Finals picks up where summers left off."
        subtitle="Each plan covers one track, so finals is a new plan. Everything you built stays, and returning students get season-2 pricing rather than list price."
      />
      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        <Card variant="feature" className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className={eyebrow}>Coming with you</h2>
            <Badge tone="green">Nothing reset</Badge>
          </div>
          <dl className="mt-3">
            {season.carried.map((c) => (
              <div
                key={c.label}
                className="border-line flex justify-between gap-4 border-b py-3 last:border-0"
              >
                <dt>{c.label}</dt>
                <dd className="text-right font-bold">{c.value}</dd>
              </div>
            ))}
          </dl>
          <p className="text-navy-400 mt-2">
            Your finals panel reads all of this before your first finals session.
          </p>
        </Card>

        <Card variant="feature" className="space-y-4 p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-2xl font-bold">Choose your finals plan</h2>
            <Badge tone="goldSoft">Season-2 prices: you set these</Badge>
          </div>
          <div role="radiogroup" aria-label="Finals plan" className="space-y-3">
            {season.plans.map((p) => {
              const on = p.id === planId;
              return (
                <button
                  key={p.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setPlanId(p.id)}
                  className={cn(
                    "rounded-card flex min-h-11 w-full flex-wrap items-center justify-between gap-x-4 gap-y-1 border bg-white p-5 text-left",
                    on ? "border-maroon-600 border-2" : "border-line",
                  )}
                >
                  <span>
                    <span className="flex flex-wrap items-center gap-2 font-semibold">
                      {p.name} · Finals
                      {p.suggested && <Badge tone="maroon">Suggested</Badge>}
                    </span>
                    <span className="text-navy-400 block">{p.blurb}</span>
                  </span>
                  <span className="text-lg">
                    <s className="text-navy-400">{formatINR(p.listPrice)}</s>{" "}
                    <strong>[Season 2 price]</strong>
                  </span>
                </button>
              );
            })}
          </div>
          <div className="flex flex-col gap-3 pt-2 md:flex-row md:items-center md:justify-between">
            <p className="text-navy-400">Day 0 for finals: set by your placement cell.</p>
            <Button onClick={() => navigate(ROUTES.student.checkout(planId))}>
              Continue with {chosen?.name ?? "Premium"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
