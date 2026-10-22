"use client";

import dynamic from "next/dynamic";
import { useRunway } from "@/features/runway/hooks/useRunway";
import type { Role } from "@/lib/auth/roles";
import { AccountMenu } from "./AccountMenu";
import { NotificationBell } from "./NotificationBell";

// Only ops has these actions; keep their code out of the student and panelist first load.
const OpsActions = dynamic(() => import("./OpsActions"), { ssr: false });

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

/** Top-right cluster from the mockups: Day 0 pill, bell and avatar (student); avatar (panelist); Export and avatar (ops). */
export function ShellActions({ role }: { role: Role }) {
  return (
    <div className="flex items-center gap-3">
      {role === "student" && (
        <>
          <DayZeroPill />
          <NotificationBell />
        </>
      )}
      {role === "ops" && <OpsActions />}
      <AccountMenu role={role} />
    </div>
  );
}
