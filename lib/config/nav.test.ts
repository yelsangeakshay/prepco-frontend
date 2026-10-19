import { describe, expect, it } from "vitest";
import { NAV } from "./nav";
import { SCREENS } from "./screens";
import { ROLES } from "@/lib/auth/roles";

const toRegex = (pattern: string) => new RegExp(`^${pattern.replace(/\[\w+\]/g, "[^/]+")}$`);

describe("nav", () => {
  it.each(ROLES)("every %s nav link resolves to a real screen", (role) => {
    const items = NAV[role].sections.flatMap((s) => s.items);
    expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      expect(item.href).not.toBe("#");
      const hit = SCREENS.find((s) => s.access === role && toRegex(s.pattern).test(item.href));
      expect(hit, `${role}: ${item.href}`).toBeDefined();
    }
  });

  it("matches the section titles from the mockups", () => {
    expect(NAV.student.sections.map((s) => s.title)).toEqual(["Your runway", "Tools", "Account"]);
    expect(NAV.panelist.sections.map((s) => s.title)).toEqual(["Panels", "Account"]);
    expect(NAV.ops.sections.map((s) => s.title)).toEqual(["Cohort", "Business"]);
  });
});
