"use client";

import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { LogOut, X } from "lucide-react";
import type { NavItem } from "@/lib/config/nav";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { useSignOut } from "@/features/auth/hooks/useAuth";
import { isActive } from "./Sidebar";

/** The phone "More" sheet. Loaded lazily on first tap. */
export default function MoreSheet({
  title,
  items,
  pathname,
  onClose,
}: {
  title: string;
  items: NavItem[];
  pathname: string;
  onClose: () => void;
}) {
  const { signOut, pending } = useSignOut();
  return (
    <Dialog.Root open onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content className="rounded-t-feature fixed inset-x-0 bottom-0 z-50 max-h-[80dvh] overflow-y-auto bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
          <div className="flex items-center justify-between">
            <Dialog.Title className="font-display text-lg font-bold">{title}</Dialog.Title>
            <Dialog.Close aria-label="Close" className="flex size-11 items-center justify-center">
              <X className="size-5" />
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">Other sections</Dialog.Description>
          <ul className="mt-2 flex flex-col">
            {items.map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-12 items-center gap-3 text-sm font-medium",
                      active && "text-maroon-600",
                    )}
                  >
                    <Icon className="size-5" aria-hidden />
                    {item.label}
                    {item.badge && (
                      <span className="bg-gold-500 text-navy-900 ml-auto rounded-full px-2 py-0.5 text-xs font-semibold">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
          <Button
            variant="ghost"
            className="mt-2 w-full justify-start gap-3 px-0"
            loading={pending}
            onClick={signOut}
          >
            <LogOut className="size-5" aria-hidden />
            Sign out
          </Button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
