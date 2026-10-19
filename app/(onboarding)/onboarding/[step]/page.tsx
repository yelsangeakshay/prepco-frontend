import { notFound } from "next/navigation";
import { ScreenPlaceholder } from "@/components/shared/ScreenPlaceholder";

export default async function Page({ params }: { params: Promise<{ step: string }> }) {
  const p = await params;
  if (!["1", "2", "3"].includes(p.step)) notFound();
  return <ScreenPlaceholder code="S2" title="Onboarding" params={p} />;
}
