import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The brief lists 21 journeys across Phases 3 to 5. Each must exist as a named
 * `test.describe` in tests/e2e. Names are compared ignoring punctuation and case.
 */
const JOURNEYS = [
  // Phase 3
  "Join and buy a plan",
  "First login, nothing booked",
  "Locked out / wrong email",
  "Payment fails",
  "Cohort is full",
  "Joined late",
  "Session cancelled/moved/missed",
  // Phase 4
  "Prepare for Day 0",
  "On a phone start to finish",
  "Routes and extras",
  "Upgrade mid-season",
  "Day 0 moves",
  "After Day 0",
  // Phase 5
  "Become a panelist",
  "Run a panel",
  "Set availability",
  "Weekly ops loop",
  "Keep the panel healthy",
  "One panel, three roles",
  "Target role changes",
  "Not placed, credit carried over",
];

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

describe("journey specs", () => {
  const dir = path.resolve(__dirname, "e2e");
  const titles = readdirSync(dir)
    .filter((f) => f.endsWith(".spec.ts"))
    .flatMap((f) =>
      [...readFileSync(path.join(dir, f), "utf8").matchAll(/test\.describe\(\s*"([^"]+)"/g)].map(
        (m) => norm(m[1]!),
      ),
    );

  it("lists 21 journeys", () => {
    expect(JOURNEYS).toHaveLength(21);
  });

  it.each(JOURNEYS)("has an e2e describe for: %s", (name) => {
    expect(titles).toContain(norm(name));
  });
});
