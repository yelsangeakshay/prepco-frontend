import type { Metadata } from "next";
import { ApplicationsView } from "@/features/ops/components/ApplicationsView";

export const metadata: Metadata = { title: "Panelist applications" };

export default function Page() {
  return <ApplicationsView />;
}
