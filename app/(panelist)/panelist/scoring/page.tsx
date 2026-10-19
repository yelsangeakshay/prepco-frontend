import type { Metadata } from "next";
import { ScoringList } from "@/features/panelist/components/ScoringViews";

export const metadata: Metadata = { title: "Scoring & feedback" };

export default function Page() {
  return <ScoringList />;
}
