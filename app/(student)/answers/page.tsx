import type { Metadata } from "next";
import { AnswersView } from "@/features/answer-bank/components/AnswersView";

export const metadata: Metadata = { title: "Answer bank" };

export default function Page() {
  return <AnswersView />;
}
