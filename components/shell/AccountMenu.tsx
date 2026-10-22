"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { Role } from "@/lib/auth/roles";
import { ROLE_PROFILE } from "@/lib/config/nav";
import { Avatar } from "./Avatar";

const AccountPanel = dynamic(() => import("./AccountPanel"), { ssr: false });

/** The avatar is the account menu button. The menu itself loads on first open. */
export function AccountMenu({ role }: { role: Role }) {
  const p = ROLE_PROFILE[role];
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  return (
    <div className="relative">
      <button
        ref={trigger}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${p.initials}, account menu for ${p.name}`}
        onClick={() => setOpen((o) => !o)}
        className="rounded-full"
      >
        <Avatar
          initials={p.initials}
          label={p.name}
          tone={role === "student" ? "maroon" : role === "ops" ? "gold" : "navy"}
          className={role === "panelist" ? "max-md:bg-maroon-600" : undefined}
        />
      </button>
      {open && <AccountPanel role={role} onClose={() => setOpen(false)} triggerRef={trigger} />}
    </div>
  );
}
