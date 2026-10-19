import type { Metadata } from "next";
import { ApplyForm } from "@/features/panelist/components/ApplyForm";

export const metadata: Metadata = { title: "Become a panelist" };

export default function Page() {
  return <ApplyForm />;
}
