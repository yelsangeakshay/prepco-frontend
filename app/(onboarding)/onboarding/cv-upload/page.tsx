import type { Metadata } from "next";
import { CvUpload } from "@/features/onboarding/components/CvUpload";

export const metadata: Metadata = { title: "Upload your CV" };

export default function Page() {
  return <CvUpload />;
}
