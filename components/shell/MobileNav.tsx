"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal, UserRound } from "lucide-react";
import { MORE_LABEL, NAV } from "@/lib/config/nav";
import type { Role } from "@/lib/auth/roles";
import { cn } from "@/lib/utils/cn";
import { isActive } from "./Sidebar";

const MoreSheet = dynamic(() => import("./MoreSheet"), { ssr: false });

/** Phone (<768px): bottom bar with the key items plus a "More" sheet. */
export function MobileNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const all = NAV[role].sections.flatMap((s) => s.items);
  const pinned = all.filter((i) => i.mobile).slice(0, 4);
  const rest = all.filter((i) => !pinned.includes(i));
  const moreActive = rest.some((i) => isActive(pathname, i));

  return (
    <nav
      aria-label="Mobile"
      className="border-line fixed inset-x-0 bottom-0 z-40 flex border-t bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {pinned.map((item) => {
        const active = isActive(pathname, item);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium",
              active ? "text-maroon-600" : "text-navy-400",
            )}
          >
            <Icon className="size-5" aria-hidden />
            <span className="max-w-full truncate px-1">
              {item.mobileLabel ?? item.label.split(" ")[0]}
            </span>
          </Link>
        );
      })}
      <button
        ref={trigger}
        type="button"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        className={cn(
          "flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium",
          moreActive ? "text-maroon-600" : "text-navy-400",
        )}
      >
        {role === "student" ? (
          <UserRound className="size-5" aria-hidden />
        ) : (
          <MoreHorizontal className="size-5" aria-hidden />
        )}
        {MORE_LABEL[role]}
      </button>
      {open && (
        <MoreSheet
          title={MORE_LABEL[role]}
          items={rest}
          pathname={pathname}
          onClose={() => {
            setOpen(false);
            requestAnimationFrame(() => trigger.current?.focus());
          }}
        />
      )}
    </nav>
  );
}
