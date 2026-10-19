import type { Metadata } from "next";
import { SessionDetail } from "@/features/runway/components/SessionDetail";

export const metadata: Metadata = { title: "Session" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SessionDetail id={id} />;
}
