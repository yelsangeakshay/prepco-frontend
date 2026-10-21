const TZ = "Asia/Kolkata";

function parts(date: Date, opts: Intl.DateTimeFormatOptions) {
  const out: Record<string, string> = {};
  for (const p of new Intl.DateTimeFormat("en-IN", { timeZone: TZ, ...opts }).formatToParts(date)) {
    out[p.type] = p.value;
  }
  return out;
}

/** "Wed 7 Oct" */
export function formatDay(input: Date | string): string {
  const p = parts(new Date(input), { weekday: "short", day: "numeric", month: "short" });
  return `${p.weekday} ${p.day} ${p.month}`;
}

/** "Tue, 8 Sep 2026" */
export function formatDayYear(input: Date | string): string {
  const p = parts(new Date(input), {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `${p.weekday}, ${p.day} ${(p.month ?? "").replace(/^Sept$/, "Sep")} ${p.year}`;
}

/** "7:00 PM" */
export function formatTime(input: Date | string): string {
  const p = parts(new Date(input), { hour: "numeric", minute: "2-digit", hour12: true });
  return `${p.hour}:${p.minute} ${(p.dayPeriod ?? "").toUpperCase()}`;
}

/** "Wed 7 Oct · 7:00 PM IST" */
export function formatSession(input: Date | string): string {
  return `${formatDay(input)} · ${formatTime(input)} IST`;
}

const istDay = (d: Date) => {
  const ist = new Date(d.getTime() + 5.5 * 3_600_000);
  return Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate());
};

/** Whole IST calendar days from the pinned "today" to a date. 2 means "in 2 days". */
export function daysUntil(input: Date | string, today: Date): number {
  return Math.round((istDay(new Date(input)) - istDay(today)) / 86_400_000);
}
