import type { Metadata } from "next";
import { SessionsView } from "@/features/runway/components/SessionsView";

export const metadata: Metadata = { title: "Sessions & runway" };

export default function Page() {
  return <SessionsView />;
}
