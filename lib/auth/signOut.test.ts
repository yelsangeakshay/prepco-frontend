import { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it } from "vitest";
import { clearLocalSession } from "./signOut";

describe("clearLocalSession", () => {
  beforeEach(() => {
    localStorage.clear();
    document.cookie = "prepco_role=student; path=/";
    document.cookie = "prepco_onboarded=1; path=/";
  });

  it("drops cached data, the session cookies and the prepco drafts, and nothing else", async () => {
    const qc = new QueryClient();
    qc.setQueryData(["runway"], { secret: true });
    localStorage.setItem("prepco-scoring-s-1", "{}");
    localStorage.setItem("prepco-onboarding-draft", "{}");
    localStorage.setItem("theme", "dark");

    await clearLocalSession(qc);

    expect(qc.getQueryData(["runway"])).toBeUndefined();
    expect(document.cookie).not.toContain("prepco_role=student");
    expect(document.cookie).not.toContain("prepco_onboarded=1");
    expect(localStorage.getItem("prepco-scoring-s-1")).toBeNull();
    expect(localStorage.getItem("prepco-onboarding-draft")).toBeNull();
    expect(localStorage.getItem("theme")).toBe("dark");
  });
});
