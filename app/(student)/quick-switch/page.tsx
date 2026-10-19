import type { Metadata } from "next";
import { QuickSwitchView } from "@/features/journey/components/QuickSwitchView";

export const metadata: Metadata = { title: "Quick Switch" };

export default function Page() {
  return <QuickSwitchView />;
}
