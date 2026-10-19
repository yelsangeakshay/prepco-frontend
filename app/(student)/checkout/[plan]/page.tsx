import { ScreenPlaceholder } from "@/components/shared/ScreenPlaceholder";

export default async function Page({ params }: { params: Promise<{ plan: string }> }) {
  const p = await params;
  return <ScreenPlaceholder code="S4" title="Checkout" params={p} />;
}
