import type { Metadata } from "next";
import { OpsOverview } from "@/features/ops/components/OpsOverview";

export const metadata: Metadata = { title: "Cohort overview" };

export default function Page() {
  return <OpsOverview />;
}
