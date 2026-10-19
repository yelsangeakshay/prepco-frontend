import type { Metadata } from "next";
import { AnswerDetailView } from "@/features/answer-bank/components/AnswerDetailView";

export const metadata: Metadata = { title: "Answer" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AnswerDetailView id={id} />;
}
