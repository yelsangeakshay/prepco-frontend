import type { Metadata } from "next";
import { StudentsView } from "@/features/ops/components/StudentsView";

export const metadata: Metadata = { title: "Students" };

export default function Page() {
  return <StudentsView />;
}
