import type { Metadata } from "next";
import { HomeView } from "@/features/runway/components/HomeView";

export const metadata: Metadata = { title: "Home" };

export default function Page() {
  return <HomeView />;
}
