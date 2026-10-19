import type { Metadata } from "next";
import { VerifyEmailPanel } from "@/features/auth/components/VerifyEmailPanel";

export const metadata: Metadata = { title: "Verify email" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  return <VerifyEmailPanel email={email} />;
}
