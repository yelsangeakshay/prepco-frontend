import { describe, expect, it } from "vitest";
import { statusTone } from "./status";

describe("statusTone", () => {
  it("gives done, action, upcoming and premium words their own colour", () => {
    expect(statusTone("Rehearsed")).toBe("green");
    expect(statusTone("Feedback sent")).toBe("green");
    expect(statusTone("flagged")).toBe("maroonSoft");
    expect(statusTone("Needs scoring")).toBe("maroonSoft");
    expect(statusTone("Scheduled")).toBe("neutral");
    expect(statusTone("elite")).toBe("gold");
  });

  it("never colours a panelist verdict of Needs work like Ready", () => {
    expect(statusTone("Needs work")).not.toBe(statusTone("Ready"));
    expect(statusTone("Needs work")).toBe("maroonSoft");
    expect(statusTone("Ready")).toBe("green");
  });

  it("falls back to neutral for an unknown word", () => {
    expect(statusTone("something new")).toBe("neutral");
  });

  it("ignores case and padding", () => {
    expect(statusTone("  DONE ")).toBe("green");
  });
});
