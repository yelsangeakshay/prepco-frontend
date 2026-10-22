"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCohort } from "@/features/ops/hooks/useOps";
import { getOpsLedger } from "@/lib/api/endpoints/ops";
import { ROUTES } from "@/lib/config/routes";
import { formatINR } from "@/lib/utils/currency";

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
    downloadCsv(rows, "cohort-overview.csv");
  };
  return (
    <Button variant="secondary" onClick={download} disabled={!data}>
      Export
    </Button>
  );
}

function downloadCsv(rows: string[][], name: string) {
  const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

/** Ledger "Export CSV" (a05.png): every entry, not only the page on screen. */
function ExportLedgerButton() {
  const download = async () => {
    const l = await getOpsLedger({ pageSize: 1000 });
    downloadCsv(
      [
        ["Date", "Student", "Description", "Type", "Amount"],
        ...l.items.map((e) => [e.at, e.studentName, e.description, e.type, String(e.amount)]),
      ],
      "ledger.csv",
    );
  };
  return (
    <Button variant="secondary" onClick={download}>
      Export CSV
    </Button>
  );
}

/** Ops actions differ per screen, as drawn: Export on the overview, Export CSV on the ledger, the application form on the roster. */
export default function OpsActions() {
  const path = usePathname();
  if (path === "/ops") return <ExportButton />;
  if (path === "/ops/ledger") return <ExportLedgerButton />;
  if (path === "/ops/panelists")
    return (
      <Button asChild variant="secondary" className="max-md:hidden">
        <Link href={ROUTES.panelistApply}>View application form</Link>
      </Button>
    );
  return null;
}
