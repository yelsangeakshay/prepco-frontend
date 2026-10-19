"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatINR } from "@/lib/utils/currency";

const MAROON = "#7C1F34";
const GOLD = "#C0993D";

/** Revenue by tier. Lazy-loaded: Recharts is heavy. */
export function RevenueChart({ data }: { data: { tier: string; amount: number }[] }) {
  return (
    <div role="img" aria-label="Revenue by tier" className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2DCCD" />
          <XAxis dataKey="tier" tickLine={false} axisLine={false} />
          <YAxis
            width={64}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => `₹${(v / 100000).toFixed(0)}L`}
          />
          <Tooltip formatter={(v) => formatINR(Number(v))} />
          <Bar dataKey="amount" fill={MAROON} radius={[6, 6, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Panels per day this week, with the unassigned share in gold. */
export function WeekChart({
  data,
}: {
  data: { day: string; panels: number; unassigned: number }[];
}) {
  const rows = data.map((d) => ({
    day: d.day,
    assigned: d.panels - d.unassigned,
    unassigned: d.unassigned,
  }));
  return (
    <div role="img" aria-label="Panels this week" className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2DCCD" />
          <XAxis dataKey="day" tickLine={false} axisLine={false} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
          <Tooltip />
          <Bar dataKey="assigned" stackId="a" fill={MAROON} isAnimationActive={false} />
          <Bar
            dataKey="unassigned"
            stackId="a"
            fill={GOLD}
            radius={[6, 6, 0, 0]}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
