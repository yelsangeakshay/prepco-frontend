import type { Metadata } from "next";
import { BriefDetail } from "@/features/panelist/components/BriefViews";

export const metadata: Metadata = { title: "Brief" };

export default async function Page({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  return <BriefDetail sessionId={sessionId} />;
}
