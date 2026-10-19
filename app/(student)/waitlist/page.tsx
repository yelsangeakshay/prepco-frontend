import type { Metadata } from "next";
import { WaitlistViewLazy } from "@/features/checkout/components/lazy";

export const metadata: Metadata = { title: "Waitlist" };

export default function Page() {
  return <WaitlistViewLazy />;
}
