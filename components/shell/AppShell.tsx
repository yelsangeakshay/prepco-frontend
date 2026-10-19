import type { ReactNode } from "react";
import type { Role } from "@/lib/auth/roles";
import { MobileNav } from "./MobileNav";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function AppShell({ role, children }: { role: Role; children: ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <Sidebar role={role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar role={role} />
        <main id="main" className="flex-1 pb-20 md:pb-0">
          {children}
        </main>
      </div>
      <MobileNav role={role} />
    </div>
  );
}
