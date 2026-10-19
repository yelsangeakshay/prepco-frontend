import type { ReactNode } from "react";
import { AppShell } from "@/components/shell/AppShell";
import { requireRole } from "@/lib/auth/session";

export default async function Layout({ children }: { children: ReactNode }) {
  const role = await requireRole("student");
  return <AppShell role={role}>{children}</AppShell>;
}
