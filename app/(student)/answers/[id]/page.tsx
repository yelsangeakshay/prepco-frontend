import { ScreenPlaceholder } from "@/components/shared/ScreenPlaceholder";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const p = await params;
  return <ScreenPlaceholder code="S8" title="Answer detail" params={p} />;
}
