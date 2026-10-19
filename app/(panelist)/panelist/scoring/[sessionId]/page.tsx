import type { Metadata } from "next";
import { LiveScoring } from "@/features/panelist/components/ScoringViews";

export const metadata: Metadata = { title: "Live scoring" };

export default async function Page({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  return <LiveScoring sessionId={sessionId} />;
}
