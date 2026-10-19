import type { Metadata } from "next";
import { ResetPasswordFormLazy } from "@/features/auth/components/lazy";

export const metadata: Metadata = { title: "Reset password" };

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <ResetPasswordFormLazy token={token} />;
}
