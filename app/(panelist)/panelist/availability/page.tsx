import type { Metadata } from "next";
import { AvailabilityView } from "@/features/panelist/components/AvailabilityView";

export const metadata: Metadata = { title: "Availability" };

export default function Page() {
  return <AvailabilityView />;
}
