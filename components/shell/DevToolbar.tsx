"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wrench } from "lucide-react";
import {
  ROLE_COOKIE,
  ROLE_HOME,
  ROLE_LABEL,
  ROLES,
  SCENARIO_COOKIE,
  isRole,
  type Role,
} from "@/lib/auth/roles";
import { SCENARIOS } from "@/lib/config/scenarios";
import { ROUTES } from "@/lib/config/routes";

function readCookie(name: string): string {
  if (typeof document === "undefined") return "";
  return (
    document.cookie
      .split("; ")
      .find((c) => c.startsWith(`${name}=`))
      ?.split("=")[1] ?? ""
  );
}

function writeCookie(name: string, value: string) {
  document.cookie = value
    ? `${name}=${value}; path=/; SameSite=Lax`
    : `${name}=; path=/; max-age=0; SameSite=Lax`;
}

/** Dev-only: switch role and scenario. Hidden in production builds. */
export function DevToolbar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<string>(() => readCookie(ROLE_COOKIE));
  const [scenario, setScenario] = useState<string>(() => readCookie(SCENARIO_COOKIE));

  if (process.env.NODE_ENV === "production") return null;

  const onRole = (value: string) => {
    setRole(value);
    writeCookie(ROLE_COOKIE, value);
    router.push(isRole(value) ? ROLE_HOME[value as Role] : ROUTES.signIn);
    router.refresh();
  };

  const onScenario = (value: string) => {
    setScenario(value);
    writeCookie(SCENARIO_COOKIE, value);
    router.refresh();
  };

  return (
    <div data-testid="dev-toolbar" className="fixed right-3 bottom-20 z-[60] text-xs md:bottom-3">
      {open ? (
        <div className="bg-navy-900 w-64 space-y-3 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Dev toolbar</span>
            <button type="button" onClick={() => setOpen(false)} className="min-h-8 px-2 underline">
              Close
            </button>
          </div>
          <label className="block">
            <span className="mb-1 block text-white/70">Role</span>
            <select
              value={role}
              onChange={(e) => onRole(e.target.value)}
              className="text-navy-900 min-h-11 w-full rounded-md bg-white px-2"
            >
              <option value="">Signed out</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABEL[r]}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-white/70">Scenario</span>
            <select
              value={scenario}
              onChange={(e) => onScenario(e.target.value)}
              className="text-navy-900 min-h-11 w-full rounded-md bg-white px-2"
            >
              <option value="">None</option>
              {SCENARIOS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open dev toolbar"
          className="bg-navy-900 flex size-11 items-center justify-center rounded-full text-white shadow-lg"
        >
          <Wrench className="size-4" />
        </button>
      )}
    </div>
  );
}
