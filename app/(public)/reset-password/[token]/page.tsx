import type { Metadata } from "next";
import { ResetPasswordForm } from "@/features/auth/components/RecoveryForms";

export const metadata: Metadata = { title: "Reset password" };

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <ResetPasswordForm token={token} />;
}
