import type { Runway } from "../schemas";

const COPY: Record<
  NonNullable<Runway["banner"]>,
  { title: string; body: (r: Runway) => string }
> = {
  "late-joiner": {
    title: "You joined late",
    body: (r) =>
      `Your runway is compressed to ${r.totalCount} sessions before Day 0 (${r.day0.label}).`,
  },
  "day0-moved": {
    title: "Day 0 has moved",
    body: (r) =>
      `Day 0 moved from ${r.day0.movedFrom} to ${r.day0.label}. Your remaining sessions still fit.`,
  },
  "first-login": {
    title: "Welcome to The Prep Co",
    body: () => "Nothing is booked yet. Start with your free session.",
  },
  placed: {
    title: "Congratulations",
    body: () => "Your placement is recorded. See your summary.",
  },
  "not-placed": {
    title: "Your credit is carried over",
    body: () => "We are sorry it did not work out this season. Your credit moves to the next one.",
  },
  "returning-student": {
    title: "Welcome back",
    body: () => "Your runway and answers are right where you left them.",
  },
};

export function RunwayBanner({ runway }: { runway: Runway }) {
  if (!runway.banner) return null;
  const c = COPY[runway.banner];
  return (
    <div
      role="note"
      data-testid={`banner-${runway.banner}`}
      className="bg-cream-soft rounded-card border-gold-500 border-l-4 p-4 text-sm"
    >
      <p className="font-semibold">{c.title}</p>
      <p className="text-navy-400 mt-0.5">{c.body(runway)}</p>
    </div>
  );
}
