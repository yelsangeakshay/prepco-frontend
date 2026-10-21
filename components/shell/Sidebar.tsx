"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV, ROLE_TAGLINE, type NavItem } from "@/lib/config/nav";
import { ROLE_HOME, type Role } from "@/lib/auth/roles";
import { cn } from "@/lib/utils/cn";
import { useOpsBadge } from "@/features/ops/hooks/useOpsBadge";
import { usePanelistToday } from "@/features/panelist/hooks/usePanelist";
import { useRunway } from "@/features/runway/hooks/useRunway";
import { ROUTES } from "@/lib/config/routes";
import { Wordmark } from "./Wordmark";

export function isActive(pathname: string, item: NavItem) {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

const card = "rounded-card border border-white/15 p-4";
const eyebrow = "text-gold-500 text-xs font-semibold tracking-[0.14em] uppercase";

function StudentFooter() {
  const { data } = useRunway();
  const done = data?.doneCount ?? 0;
  const total = data?.totalCount ?? 6;
  return (
    <div className={card}>
      <p className={eyebrow}>
        {data ? `${data.student.plan} · ${data.student.track}` : "Premium · Finals"}
      </p>
      <p className="mt-1.5 text-sm text-white/80">
        {done} of {total} runway sessions done
      </p>
      <div
        role="progressbar"
        aria-valuenow={done}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label="Runway sessions done"
        className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/15"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--maroon-600)] to-[var(--gold-500)]"
          style={{ width: `${(done / total) * 100}%` }}
        />
      </div>
    </div>
  );
}

function PanelistFooter() {
  const { data } = usePanelistToday();
  return (
    <div className={card}>
      <p className={eyebrow}>{data?.panelist.specialty ?? "Marketing & Brand"}</p>
      <p className="mt-1.5 text-sm text-white/80">
        {data?.panelist.panelsThisSeason ?? 12} panels this season
      </p>
    </div>
  );
}

function OpsFooter() {
  return (
    <div className={card}>
      <p className={eyebrow}>Season 1</p>
      <p className="mt-1.5 text-sm text-white/80">Finals Day 0 · Mon 9 Nov</p>
    </div>
  );
}

function FooterCard({ role }: { role: Role }) {
  if (role === "student") return <StudentFooter />;
  if (role === "panelist") return <PanelistFooter />;
  return <OpsFooter />;
}

/** Full sidebar at xl, icon rail at md, hidden on phones (MobileNav takes over). */
export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const config = NAV[role];
  // Live count of panels waiting for a panelist.
  const unassigned = useOpsBadge(role === "ops").data?.unassigned;

  return (
    <aside
      aria-label="Sidebar"
      className="bg-navy-900 sticky top-0 hidden h-dvh w-[72px] shrink-0 flex-col gap-7 overflow-y-auto px-3 py-6 md:flex xl:w-[249px] xl:px-4"
    >
      <Link href={ROLE_HOME[role]} className="px-2 max-xl:flex max-xl:justify-center max-xl:px-0">
        <span className="xl:hidden">
          <span className="text-gold-300 text-[22px] font-semibold" aria-hidden>
            [
          </span>
          <span className="sr-only">The Prep Co.</span>
        </span>
        <span className="max-xl:hidden">
          <Wordmark tone="dark" tagline={ROLE_TAGLINE[role]} />
        </span>
      </Link>

      <nav aria-label="Primary" className="flex flex-1 flex-col gap-6">
        {config.sections.map((section) => (
          <div key={section.title}>
            <p className="px-3 pb-2 text-[11px] font-semibold tracking-[0.16em] text-white/55 uppercase max-xl:sr-only">
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
                        "rounded-control flex min-h-11 items-center gap-3 px-3 text-[15px] font-medium transition-colors max-xl:justify-center",
                        active
                          ? "bg-maroon-600 text-white"
                          : "text-white/75 hover:bg-white/10 hover:text-white",
                      )}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "size-1.5 shrink-0 rounded-full max-xl:hidden",
                          active ? "bg-gold-500" : "bg-white/35",
                        )}
                      />
                      <Icon className="size-5 shrink-0 xl:hidden" aria-hidden />
                      <span className="max-xl:sr-only">{item.label}</span>
                      {badge && (
                        <span
                          className={cn(
                            "ml-auto text-[11px] font-bold max-xl:hidden",
                            item.badgeTone === "gold"
                              ? "bg-gold-500 text-navy-900 rounded-full px-2.5 py-0.5 tracking-wide uppercase"
                              : "bg-maroon-600 flex size-6 items-center justify-center rounded-full text-white",
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
