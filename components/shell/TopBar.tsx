import { ROLE_HOME, type Role } from "@/lib/auth/roles";
import { ROLE_PROFILE } from "@/lib/config/nav";
import { Logo } from "./Logo";
import { NotificationBell } from "./NotificationBell";

export function TopBar({ role }: { role: Role }) {
  const profile = ROLE_PROFILE[role];
  return (
    <header className="border-line sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-[var(--cream)]/90 px-4 backdrop-blur md:px-8">
      <Logo href={ROLE_HOME[role]} className="md:hidden" compact />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{profile.name}</p>
        <p className="text-navy-400 truncate text-xs">{profile.subtitle}</p>
      </div>
      {role === "student" && <NotificationBell unread={2} />}
      <span
        aria-label={profile.name}
        className="bg-navy-900 flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
      >
        {profile.initials}
      </span>
    </header>
  );
}
