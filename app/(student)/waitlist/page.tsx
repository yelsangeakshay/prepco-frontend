import type { Metadata } from "next";
import { WaitlistView } from "@/features/checkout/components/WaitlistView";

export const metadata: Metadata = { title: "Waitlist" };

export default function Page() {
  return <WaitlistView />;
}
