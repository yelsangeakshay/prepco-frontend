import type { Metadata } from "next";
import { PlansView } from "@/features/plans/components/PlansView";

export const metadata: Metadata = { title: "Plans" };

export default function Page() {
  return <PlansView />;
}
