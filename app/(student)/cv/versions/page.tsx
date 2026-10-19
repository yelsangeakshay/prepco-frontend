import type { Metadata } from "next";
import { CvVersionsView } from "@/features/cv-builder/components/CvVersionsView";

export const metadata: Metadata = { title: "CV versions" };

export default function Page() {
  return <CvVersionsView />;
}
