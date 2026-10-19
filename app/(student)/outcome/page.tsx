import type { Metadata } from "next";
import { OutcomeView } from "@/features/outcome/components/OutcomeView";

export const metadata: Metadata = { title: "Outcome" };

export default function Page() {
  return <OutcomeView />;
}
