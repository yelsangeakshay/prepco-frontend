/**
 * Single source of "now" for the whole app.
 * Today = Monday 5 October 2026. Day 0 = Monday 9 November 2026 (35 days).
 */
export const TODAY_ISO = "2026-10-05T12:00:00+05:30";
export const DAY0_ISO = "2026-11-09T09:00:00+05:30";

export function now(): Date {
  return new Date(TODAY_ISO);
}

export function day0(): Date {
  return new Date(DAY0_ISO);
}

const MS_PER_DAY = 86_400_000;

/** Whole calendar days from today to Day 0, by IST date. */
export function daysToDay0(): number {
  const start = Date.UTC(2026, 9, 5);
  const end = Date.UTC(2026, 10, 9);
  return Math.round((end - start) / MS_PER_DAY);
}
