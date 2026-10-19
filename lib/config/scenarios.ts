/** Edge-case scenarios. Open any of them with `?scenario=<name>` or the dev toolbar. */
export const SCENARIOS = [
  "payment-failed",
  "payment-success",
  "cohort-full",
  "late-joiner",
  "cv-upload-failed",
  "panelist-cancelled",
  "student-reschedule",
  "no-show",
  "day0-moved",
  "placed",
  "not-placed",
  "first-login",
  "gmail-unverified",
  "basic-ended",
  "target-change",
  "returning-student",
] as const;

export type Scenario = (typeof SCENARIOS)[number];

export function isScenario(value: unknown): value is Scenario {
  return typeof value === "string" && (SCENARIOS as readonly string[]).includes(value);
}

export const SCENARIO_HEADER = "x-prepco-scenario";
