"use client";

import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/config/routes";
import { notify } from "@/lib/utils/notify";
import { RecoveryShell } from "./AuthShell";

/** The "add your college email" prompt (e01.png, bottom banner) shown to students who signed in with a personal address. */
export function VerifyEmailPanel({ email }: { email?: string }) {
  return (
    <RecoveryShell eyebrow="Account access" title="Verify your email">
      <div className="border-maroon-600 rounded-feature -mx-2 border-2 p-4">
        <Mail className="text-maroon-600 mb-3 size-6" aria-hidden />
        <p className="font-semibold">
          You signed in with {email ?? "a personal address"}. Add your college email.
        </p>
        <p className="text-navy-400 mt-1 text-sm leading-relaxed">
          It&apos;s how we match a free session you booked on the website, and how we read your
          placement cell&apos;s Day 0 dates. One-time code, 30 seconds.
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row-reverse">
          <Button
            className="sm:flex-1"
            onClick={() => notify("We sent a one-time code to your college email")}
          >
            Verify college email
          </Button>
          <Button asChild variant="secondary">
            <a href={ROUTES.signIn}>Later</a>
          </Button>
        </div>
      </div>
    </RecoveryShell>
  );
}
