import { ScreenPlaceholder } from "@/components/shared/ScreenPlaceholder";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const p = await params;
  return <ScreenPlaceholder code="E6" title="Session detail" params={p} />;
}
