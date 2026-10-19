import type { Metadata } from "next";
import { SignInFormLazy } from "@/features/auth/components/lazy";

export const metadata: Metadata = { title: "Sign in" };

export default function Page() {
  return <SignInFormLazy />;
}
