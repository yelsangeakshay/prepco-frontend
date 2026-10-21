import { describe, expect, it } from "vitest";
import { step2Schema, validateCvFile } from "./schemas";

describe("onboarding step 2", () => {
  const ok = { track: "finals", targetFunction: "Sales & Marketing", day0Date: "2026-11-09" };

  it("accepts a track, a target role and an ISO Day 0 date, with companies optional", () => {
    expect(step2Schema.safeParse(ok).success).toBe(true);
    expect(step2Schema.safeParse({ ...ok, companies: "FMCG, D2C" }).success).toBe(true);
  });

  it("rejects a missing target role and a malformed date", () => {
    expect(step2Schema.safeParse({ ...ok, targetFunction: undefined }).success).toBe(false);
    expect(step2Schema.safeParse({ ...ok, day0Date: "9 Nov" }).success).toBe(false);
  });
});

describe("CV file check", () => {
  it("takes PDF, DOC and DOCX up to 5 MB", () => {
    const f = (name: string, size = 1000) => validateCvFile({ name, size, type: "" });
    expect(f("cv.pdf")).toBeNull();
    expect(f("cv.doc")).toBeNull();
    expect(f("cv.docx")).toBeNull();
    expect(f("cv.jpg")).toBe("Upload a PDF or Word file.");
    expect(f("cv.pdf", 6 * 1024 * 1024)).toBe("File is larger than 5 MB.");
  });
});
