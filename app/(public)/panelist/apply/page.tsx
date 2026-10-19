import type { Metadata } from "next";
import { ApplyFormLazy } from "@/features/panelist/components/lazy";

export const metadata: Metadata = { title: "Become a panelist" };

export default function Page() {
  return <ApplyFormLazy />;
}
