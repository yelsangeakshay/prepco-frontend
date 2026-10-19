"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { MoreHorizontal, X } from "lucide-react";
import { NAV } from "@/lib/config/nav";
import type { Role } from "@/lib/auth/roles";
import { cn } from "@/lib/utils/cn";
import { isActive } from "./Sidebar";

/** Phone (<768px): bottom bar with the key items plus a "More" sheet. */
export function MobileNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
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
            <span className="max-w-full truncate px-1">{item.label.split(" ")[0]}</span>
          </Link>
        );
      })}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger
          className={cn(
            "flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium",
            moreActive ? "text-maroon-600" : "text-navy-400",
          )}
        >
          <MoreHorizontal className="size-5" aria-hidden />
          More
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
          <Dialog.Content className="rounded-t-feature fixed inset-x-0 bottom-0 z-50 max-h-[80dvh] overflow-y-auto bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
            <div className="flex items-center justify-between">
              <Dialog.Title className="font-display text-lg font-bold">More</Dialog.Title>
              <Dialog.Close aria-label="Close" className="flex size-11 items-center justify-center">
                <X className="size-5" />
              </Dialog.Close>
            </div>
            <Dialog.Description className="sr-only">Other sections</Dialog.Description>
            <ul className="mt-2 flex flex-col">
              {rest.map((item) => {
                const Icon = item.icon;
                const active = isActive(pathname, item);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex min-h-12 items-center gap-3 text-sm font-medium",
                        active && "text-maroon-600",
                      )}
                    >
                      <Icon className="size-5" aria-hidden />
                      {item.label}
                      {item.badge && (
                        <span className="bg-gold-500 text-navy-900 ml-auto rounded-full px-2 py-0.5 text-[11px] font-semibold">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </nav>
  );
}
