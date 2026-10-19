import type { Metadata } from "next";
import { LedgerView } from "@/features/ops/components/LedgerView";

export const metadata: Metadata = { title: "Plans & credits" };

export default function Page() {
  return <LedgerView />;
}
