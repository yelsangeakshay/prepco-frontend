import type { Metadata } from "next";
import { ChangeTargetView } from "@/features/profile/components/ChangeTargetView";

export const metadata: Metadata = { title: "Change target role" };

export default function Page() {
  return <ChangeTargetView />;
}
