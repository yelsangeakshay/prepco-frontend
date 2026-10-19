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

/** "7:00 PM" */
export function formatTime(input: Date | string): string {
  const p = parts(new Date(input), { hour: "numeric", minute: "2-digit", hour12: true });
  return `${p.hour}:${p.minute} ${(p.dayPeriod ?? "").toUpperCase()}`;
}

/** "Wed 7 Oct · 7:00 PM IST" */
export function formatSession(input: Date | string): string {
  return `${formatDay(input)} · ${formatTime(input)} IST`;
}
