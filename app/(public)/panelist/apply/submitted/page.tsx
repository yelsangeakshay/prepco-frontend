import type { Metadata } from "next";
import { ApplicationSubmitted } from "@/features/panelist/components/ApplicationSubmitted";

export const metadata: Metadata = { title: "Application received" };

export default function Page() {
  return <ApplicationSubmitted />;
}
