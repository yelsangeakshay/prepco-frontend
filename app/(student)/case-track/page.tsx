import type { Metadata } from "next";
import { CaseTrackView } from "@/features/journey/components/CaseTrackView";

export const metadata: Metadata = { title: "Case track" };

export default function Page() {
  return <CaseTrackView />;
}
