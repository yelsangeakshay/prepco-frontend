import type { Metadata } from "next";
import { JourneyView } from "@/features/journey/components/JourneyView";

export const metadata: Metadata = { title: "Journey & routes" };

export default function Page() {
  return <JourneyView />;
}
