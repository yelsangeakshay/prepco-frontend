import type { Metadata } from "next";
import { FreeSessionPanel } from "@/features/onboarding/components/FreeSessionPanel";

export const metadata: Metadata = { title: "Free session" };

export default function Page() {
  return <FreeSessionPanel />;
}
