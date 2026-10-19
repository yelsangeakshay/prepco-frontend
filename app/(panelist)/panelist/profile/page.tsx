import type { Metadata } from "next";
import { PanelistProfileView } from "@/features/panelist/components/PanelistProfileView";

export const metadata: Metadata = { title: "Profile" };

export default function Page() {
  return <PanelistProfileView />;
}
