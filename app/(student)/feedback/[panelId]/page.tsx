import type { Metadata } from "next";
import { FeedbackDetailView } from "@/features/feedback/components/FeedbackViews";

export const metadata: Metadata = { title: "Panel feedback" };

export default async function Page({ params }: { params: Promise<{ panelId: string }> }) {
  const { panelId } = await params;
  return <FeedbackDetailView panelId={panelId} />;
}
