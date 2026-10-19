import type { Metadata } from "next";
import { TodayView } from "@/features/panelist/components/TodayView";

export const metadata: Metadata = { title: "Today" };

export default function Page() {
  return <TodayView />;
}
