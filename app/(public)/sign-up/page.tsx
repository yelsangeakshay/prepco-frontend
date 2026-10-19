import type { Metadata } from "next";
import { SignUpFormLazy } from "@/features/auth/components/lazy";

export const metadata: Metadata = { title: "Sign up" };

export default function Page() {
  return <SignUpFormLazy />;
}
