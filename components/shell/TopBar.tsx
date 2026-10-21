import { ROLE_HOME, type Role } from "@/lib/auth/roles";
import { ROLE_TAGLINE } from "@/lib/config/nav";
import { Logo } from "./Logo";
import { ShellActions } from "./ShellActions";

/**
 * Phone: a slim bar with the wordmark and avatar (s05-mobile). Tablet and desktop: no bar; the action
 * cluster floats top right, level with each page's heading (s05, p02, a01).
 */
export function TopBar({ role }: { role: Role }) {
  const dark = role !== "student";
  return (
    <>
      <header
        className={
          dark
            ? "sticky top-0 z-30 flex h-[60px] items-center justify-between bg-[var(--navy-900)] px-4 md:hidden"
            : "border-line sticky top-0 z-30 flex h-[60px] items-center justify-between border-b bg-[var(--cream)] px-4 md:hidden"
        }
      >
        <Logo
          href={ROLE_HOME[role]}
          tone={dark ? "dark" : "light"}
          tagline={dark ? ROLE_TAGLINE[role] : undefined}
        />
        <ShellActions role={role} />
      </header>
      <div className="absolute top-6 right-6 z-30 hidden md:block xl:right-10">
        <ShellActions role={role} />
      </div>
    </>
  );
}
