import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/features/auth/components/RecoveryForms";

export const metadata: Metadata = { title: "Forgot password" };

export default function Page() {
  return <ForgotPasswordForm />;
}
