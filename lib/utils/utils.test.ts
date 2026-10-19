import { describe, expect, it } from "vitest";
import { daysToDay0, now } from "./clock";
import { formatINR } from "./currency";
import { formatSession } from "./dates";

describe("clock", () => {
  it("pins today to Mon 5 Oct 2026 and Day 0 is 35 days out", () => {
    expect(now().toISOString()).toBe("2026-10-05T06:30:00.000Z");
    expect(daysToDay0()).toBe(35);
  });
});

describe("currency", () => {
  it("uses Indian grouping", () => {
    expect(formatINR(623293)).toBe("₹6,23,293");
  });
});

describe("dates", () => {
  it("formats sessions in IST", () => {
    expect(formatSession("2026-10-07T19:00:00+05:30")).toBe("Wed 7 Oct · 7:00 PM IST");
  });
});
