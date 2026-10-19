import type { Metadata } from "next";
import { BriefList } from "@/features/panelist/components/BriefViews";

export const metadata: Metadata = { title: "Pre-panel briefs" };

export default function Page() {
  return <BriefList />;
}
