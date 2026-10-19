import type { Metadata } from "next";
import { FeedbackList } from "@/features/feedback/components/FeedbackViews";

export const metadata: Metadata = { title: "Panel feedback" };

export default function Page() {
  return <FeedbackList />;
}
