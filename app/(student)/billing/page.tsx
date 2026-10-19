import type { Metadata } from "next";
import { BillingView } from "@/features/billing/components/BillingView";

export const metadata: Metadata = { title: "Plan & billing" };

export default function Page() {
  return <BillingView />;
}
