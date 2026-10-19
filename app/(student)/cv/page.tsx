import type { Metadata } from "next";
import { CvBuilderView } from "@/features/cv-builder/components/CvBuilderView";

export const metadata: Metadata = { title: "CV Builder" };

export default function Page() {
  return <CvBuilderView />;
}
