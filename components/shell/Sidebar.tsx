"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV, NAV_FOOTER, type NavItem } from "@/lib/config/nav";
import { ROLE_HOME, type Role } from "@/lib/auth/roles";
import { cn } from "@/lib/utils/cn";
import { useOpsBadge } from "@/features/ops/hooks/useOpsBadge";
import { ROUTES } from "@/lib/config/routes";
import { Logo } from "./Logo";

export function isActive(pathname: string, item: NavItem) {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function FooterCard({ role }: { role: Role }) {
  if (role === "student") {
    const f = NAV_FOOTER.student;
    return (
      <div className="rounded-card bg-white/5 p-4">
        <p className="text-gold-300 text-xs font-semibold tracking-wider uppercase">{f.plan}</p>
        <p className="mt-1 text-sm text-white">{f.doneLabel}</p>
        <div
          role="progressbar"
          aria-valuenow={f.done}
          aria-valuemin={0}
          aria-valuemax={f.total}
          aria-label="Runway sessions done"
          className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/15"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--maroon-600)] to-[var(--gold-500)]"
            style={{ width: `${(f.done / f.total) * 100}%` }}
          />
        </div>
      </div>
    );
  }
  if (role === "panelist") {
    const f = NAV_FOOTER.panelist;
    return (
      <div className="rounded-card bg-white/5 p-4">
        <p className="text-gold-300 text-xs font-semibold tracking-wider uppercase">{f.function}</p>
        <p className="mt-1 text-sm text-white">{f.panelsThisSeason} panels this season</p>
      </div>
    );
  }
  const f = NAV_FOOTER.ops;
  return (
    <div className="rounded-card bg-white/5 p-4">
      <p className="text-gold-300 text-xs font-semibold tracking-wider uppercase">{f.season}</p>
      <p className="mt-1 text-sm text-white">{f.day0Label}</p>
    </div>
  );
}

/** Labels at xl, icon rail at md, hidden on phones (MobileNav takes over). */
export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const config = NAV[role];
  // Live count of panels waiting for a panelist.
  const unassigned = useOpsBadge(role === "ops").data?.unassigned;

  return (
    <aside
      aria-label="Sidebar"
      className="bg-navy-900 sticky top-0 hidden h-dvh w-[72px] shrink-0 flex-col gap-6 overflow-y-auto px-3 py-5 md:flex xl:w-64 xl:px-4"
    >
      <Logo href={ROLE_HOME[role]} className="text-white" compact />
      <nav aria-label="Primary" className="flex flex-1 flex-col gap-6">
        {config.sections.map((section) => (
          <div key={section.title}>
            <p className="px-3 pb-2 text-[11px] font-semibold tracking-widest text-white/50 uppercase max-xl:sr-only">
              {section.title}
            </p>
            <ul className="flex flex-col gap-1">
              {section.items.map((item) => {
                const active = isActive(pathname, item);
                const Icon = item.icon;
                const badge =
                  role === "ops" && item.href === ROUTES.ops.assignments
                    ? unassigned
                      ? String(unassigned)
                      : undefined
                    : item.badge;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      title={item.label}
                      className={cn(
                        "rounded-control flex min-h-11 items-center gap-3 px-3 text-sm font-medium transition-colors max-xl:justify-center",
                        active
                          ? "bg-maroon-600 text-white"
                          : "text-white/75 hover:bg-white/10 hover:text-white",
                      )}
                    >
                      <Icon className="size-[18px] shrink-0" aria-hidden />
                      <span className="max-xl:sr-only">{item.label}</span>
                      {badge && (
                        <span
                          className={cn(
                            "ml-auto rounded-full px-2 py-0.5 text-[11px] font-semibold max-xl:hidden",
                            item.badgeTone === "gold"
                              ? "bg-gold-500 text-navy-900"
                              : "bg-maroon-100 text-maroon-600",
                          )}
                        >
                          {badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="max-xl:hidden">
        <FooterCard role={role} />
      </div>
    </aside>
  );
}
