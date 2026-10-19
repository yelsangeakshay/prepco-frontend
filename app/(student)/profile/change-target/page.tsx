import type { Metadata } from "next";
import { ChangeTargetViewLazy } from "@/features/profile/components/lazy";

export const metadata: Metadata = { title: "Change target role" };

export default function Page() {
  return <ChangeTargetViewLazy />;
}
