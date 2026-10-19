import type { Metadata } from "next";
import { ForgotPasswordFormLazy } from "@/features/auth/components/lazy";

export const metadata: Metadata = { title: "Forgot password" };

export default function Page() {
  return <ForgotPasswordFormLazy />;
}
