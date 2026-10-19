import type { Metadata } from "next";
import { PanelistsView } from "@/features/ops/components/PanelistsView";

export const metadata: Metadata = { title: "Panelists" };

export default function Page() {
  return <PanelistsView />;
}
