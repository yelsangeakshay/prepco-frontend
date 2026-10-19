import type { Metadata } from "next";
import { AssignmentsView } from "@/features/ops/components/AssignmentsView";

export const metadata: Metadata = { title: "Panel assignment" };

export default function Page() {
  return <AssignmentsView />;
}
