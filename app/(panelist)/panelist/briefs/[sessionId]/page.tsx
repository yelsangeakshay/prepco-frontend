import { ScreenPlaceholder } from "@/components/shared/ScreenPlaceholder";

export default async function Page({ params }: { params: Promise<{ sessionId: string }> }) {
  const p = await params;
  return <ScreenPlaceholder code="P3" title="Brief" params={p} />;
}
