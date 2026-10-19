import type { Metadata } from "next";
import { UpgradeView } from "@/features/billing/components/UpgradeView";

export const metadata: Metadata = { title: "Upgrade" };

export default function Page() {
  return <UpgradeView />;
}
