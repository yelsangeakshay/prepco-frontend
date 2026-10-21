"use client";

import { Button } from "@/components/ui/button";
import { useCohort } from "@/features/ops/hooks/useOps";
import { useRunway } from "@/features/runway/hooks/useRunway";
import type { Role } from "@/lib/auth/roles";
import { ROLE_PROFILE } from "@/lib/config/nav";
import { formatINR } from "@/lib/utils/currency";
import { Avatar } from "./Avatar";
import { NotificationBell } from "./NotificationBell";

function DayZeroPill() {
  const { data } = useRunway();
  if (!data) return null;
  return (
    <span className="border-line hidden items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm font-semibold lg:inline-flex">
      <span aria-hidden className="bg-gold-500 size-2 rounded-full" />
      Day 0 in {data.day0.daysLeft} days
    </span>
  );
}

/** Ops "Export": downloads the cohort overview as CSV. */
function ExportButton() {
  const { data } = useCohort();
  const download = () => {
    if (!data) return;
    const rows = [
      ["Section", "Item", "Value"],
      ...data.seats.map((x) => ["Seats", x.label, `${x.taken}/${x.total}`]),
      ...data.funnel.map((f) => ["Free session to paid", f.label, String(f.value)]),
      ...data.revenue.lines.map((r) => [
        "Revenue",
        r.tier,
        `${r.count} x ${formatINR(r.unit)} = ${formatINR(r.amount)}`,
      ]),
      ["Revenue", "Top-ups", formatINR(data.revenue.topUps)],
      ["Revenue", "Season to date", formatINR(data.revenue.total)],
    ];
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "cohort-overview.csv";
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <Button variant="secondary" onClick={download} disabled={!data}>
      Export
    </Button>
  );
}

/** Top-right cluster from the mockups: Day 0 pill, bell and avatar (student); avatar (panelist); Export and avatar (ops). */
export function ShellActions({ role }: { role: Role }) {
  const p = ROLE_PROFILE[role];
  return (
    <div className="flex items-center gap-3">
      {role === "student" && (
        <>
          <DayZeroPill />
          <NotificationBell />
        </>
      )}
      {role === "ops" && <ExportButton />}
      <Avatar
        initials={p.initials}
        label={p.name}
        tone={role === "student" ? "maroon" : role === "ops" ? "gold" : "navy"}
        className={role === "panelist" ? "max-md:bg-maroon-600" : undefined}
      />
    </div>
  );
}
