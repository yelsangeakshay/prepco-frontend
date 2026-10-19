import type { Metadata } from "next";
import { StudentDetailView } from "@/features/ops/components/StudentDetailView";

export const metadata: Metadata = { title: "Student" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <StudentDetailView id={id} />;
}
