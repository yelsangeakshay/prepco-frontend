import { ScreenPlaceholder } from "@/components/shared/ScreenPlaceholder";

export default async function Page({ params }: { params: Promise<{ panelId: string }> }) {
  const p = await params;
  return <ScreenPlaceholder code="S10" title="Panel feedback detail" params={p} />;
}
