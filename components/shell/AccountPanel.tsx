"use client";

import { useEffect, useRef, type RefObject } from "react";
import Link from "next/link";
import { LogOut, UserRound } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useSignOut } from "@/features/auth/hooks/useAuth";
import type { Role } from "@/lib/auth/roles";
import { ROLE_PROFILE } from "@/lib/config/nav";
import { ROUTES } from "@/lib/config/routes";

const PROFILE_HREF: Partial<Record<Role, string>> = {
  student: ROUTES.student.profile,
  panelist: ROUTES.panelist.profile,
};

const item =
  "flex min-h-11 w-full items-center gap-3 rounded-control px-3 text-left text-sm font-medium hover:bg-cream-soft focus-visible:bg-cream-soft disabled:opacity-70";

/** The account menu under the avatar: who is signed in, Profile, Sign out. Loaded on first open. */
export default function AccountPanel({
  role,
  onClose,
  triggerRef,
}: {
  role: Role;
  onClose: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
}) {
  const p = ROLE_PROFILE[role];
  const panel = useRef<HTMLDivElement>(null);
  const { signOut, pending } = useSignOut();
  const profileHref = PROFILE_HREF[role];

  const items = () =>
    Array.from(
      panel.current?.querySelectorAll<HTMLElement>("[role=menuitem]:not(:disabled)") ?? [],
    );

  useEffect(() => {
    items()[0]?.focus();
    const onPointer = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!panel.current?.contains(target) && !triggerRef.current?.contains(target)) onClose();
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
    // runs once, on open
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
      triggerRef.current?.focus();
      return;
    }
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const list = items();
    const at = list.indexOf(document.activeElement as HTMLElement);
    const next =
      e.key === "ArrowDown" ? (at + 1) % list.length : (at - 1 + list.length) % list.length;
    list[next]?.focus();
  };

  return (
    <div
      ref={panel}
      role="menu"
      aria-label="Account"
      onKeyDown={onKeyDown}
      className="rounded-card border-line absolute top-full right-0 z-50 mt-2 w-64 border bg-white p-2 text-left shadow-lg"
    >
      <div className="px-3 py-2">
        <p className="font-semibold">{p.name}</p>
        <p className="text-navy-400 text-sm">{p.subtitle}</p>
      </div>
      <div className="bg-line my-1 h-px" aria-hidden />
      {profileHref && (
        <Link role="menuitem" href={profileHref} onClick={onClose} className={item}>
          <UserRound className="size-5" aria-hidden />
          Profile
        </Link>
      )}
      <button
        type="button"
        role="menuitem"
        onClick={signOut}
        disabled={pending}
        aria-busy={pending || undefined}
        className={item}
      >
        {pending ? <Spinner className="size-5" /> : <LogOut className="size-5" aria-hidden />}
        Sign out
      </button>
    </div>
  );
}
