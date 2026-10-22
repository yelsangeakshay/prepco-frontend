"use client";

import { LogOut } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useSignOut } from "@/features/auth/hooks/useAuth";

/** Sidebar footer action: full label on a wide sidebar, icon only on the rail. */
export default function SignOutButton() {
  const { signOut, pending } = useSignOut();
  return (
    <button
      type="button"
      onClick={signOut}
      disabled={pending}
      aria-busy={pending || undefined}
      title="Sign out"
      className="rounded-control flex min-h-11 w-full items-center gap-3 px-3 text-[15px] font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-70 max-xl:justify-center"
    >
      {pending ? <Spinner className="size-5" /> : <LogOut className="size-5" aria-hidden />}
      <span className="max-xl:sr-only">Sign out</span>
    </button>
  );
}
