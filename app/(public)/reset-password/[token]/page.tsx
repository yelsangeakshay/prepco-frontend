import { ScreenPlaceholder } from "@/components/shared/ScreenPlaceholder";

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const p = await params;
  return <ScreenPlaceholder code="E1" title="Reset password" params={p} />;
}
