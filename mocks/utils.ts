import { delay, HttpResponse } from "msw";
import { SCENARIO_HEADER, isScenario, type Scenario } from "@/lib/config/scenarios";

export function scenarioOf(request: Request): Scenario | null {
  const value = request.headers.get(SCENARIO_HEADER);
  return isScenario(value) ? value : null;
}

/** 200 to 600 ms so skeletons are real. Skipped under Vitest. */
declare global {
  interface Window {
    /** Set by the Web Vitals test so the budget measures our front end, not the artificial delay. */
    __PREPCO_NO_LATENCY__?: boolean;
  }
}

export async function latency() {
  if (typeof process !== "undefined" && process.env.VITEST) return;
  if (typeof window !== "undefined" && window.__PREPCO_NO_LATENCY__) return;
  await delay(200 + Math.random() * 400);
}

export function apiError(status: number, code: string, message: string) {
  return HttpResponse.json({ code, message }, { status });
}

export function paginate<T>(items: T[], url: URL) {
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
  const pageSize = Math.min(1000, Math.max(1, Number(url.searchParams.get("pageSize") ?? 25)));
  return {
    items: items.slice((page - 1) * pageSize, page * pageSize),
    total: items.length,
    page,
    pageSize,
  };
}
