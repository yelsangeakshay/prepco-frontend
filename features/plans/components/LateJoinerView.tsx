import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { ROUTES } from "@/lib/config/routes";
import type { LateJoiner } from "../schemas";

const eyebrow = "text-maroon-600 text-xs font-semibold tracking-[0.18em] uppercase";

/** E3 (e03.png): someone joined too late for the full runway, so show what still fits. */
export function LateJoinerView({ data }: { data: LateJoiner }) {
  const rec = data.recommendation;
  return (
    <div className="mx-auto max-w-6xl p-4 md:p-8">
      <div className="flex items-start justify-between gap-6">
        <header className="max-w-3xl">
          <p className={eyebrow}>Joined late · Day 0 in {data.daysLeft} days</p>
          <h1 className="font-display text-navy-900 mt-2 text-[32px] leading-tight font-bold md:text-[44px]">
            The full runway doesn&apos;t fit. Here&apos;s what does.
          </h1>
          <p className="text-navy-400 mt-3 text-lg">
            We said we&apos;d tell you honestly if there isn&apos;t enough time left for a plan to
            be worth your money. There&apos;s enough for a compressed runway, not for the eight-week
            one.
          </p>
        </header>
        <div className="rounded-feature border-line mt-14 hidden w-40 shrink-0 border bg-white p-5 text-center md:block">
          <p className="font-display text-5xl leading-none font-bold">{data.daysLeft}</p>
          <p className="text-navy-400 mt-1 text-sm">days to Day 0</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="rounded-feature border-line border bg-white p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-2xl font-bold">Your compressed runway</h2>
            <span className="bg-gold-300/40 text-navy-900 rounded-full px-3 py-1 text-xs font-semibold tracking-wider uppercase">
              Proposed policy
            </span>
          </div>
          <ul className="divide-line mt-3 divide-y">
            {data.rows.map((r) => {
              const dropped = r.status === "dropped";
              return (
                <li
                  key={`${r.when}-${r.title}`}
                  className="grid grid-cols-[88px_minmax(0,1fr)_auto] items-center gap-4 py-4"
                >
                  <span
                    className={cn(
                      "text-navy-400 text-xs font-semibold tracking-wider uppercase",
                      dropped && "line-through",
                    )}
                  >
                    {r.when}
                  </span>
                  <span>
                    <span
                      className={cn("block font-semibold", dropped && "text-navy-400 line-through")}
                    >
                      {r.title}
                    </span>
                    {r.note && <span className="text-navy-400 block text-sm">{r.note}</span>}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-semibold tracking-wider whitespace-nowrap uppercase",
                      dropped ? "bg-maroon-100 text-maroon-600" : "bg-green-100 text-green-600",
                    )}
                  >
                    {dropped ? r.reason : "Fits"}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <div className="space-y-4">
          <section className="rounded-feature border-maroon-600 border-2 bg-white p-6">
            <h2 className={eyebrow}>Our recommendation</h2>
            <p className="font-display mt-3 text-2xl leading-snug font-bold">{rec.title}</p>
            <p className="text-navy-400 mt-3 leading-relaxed">
              {rec.price}. {rec.body}
            </p>
            <Button asChild className="mt-5 w-full">
              <Link href={ROUTES.student.checkout(rec.planId)}>{rec.cta}</Link>
            </Button>
          </section>
          <section className="rounded-feature border-line border bg-white p-6">
            <h2 className={eyebrow}>Or start properly next season</h2>
            <p className="mt-3 leading-relaxed">{data.nextSeason}</p>
            <Button asChild variant="secondary" className="mt-4 w-full">
              <Link href={ROUTES.student.cv}>Keep the free CV Builder</Link>
            </Button>
          </section>
        </div>
      </div>
    </div>
  );
}
