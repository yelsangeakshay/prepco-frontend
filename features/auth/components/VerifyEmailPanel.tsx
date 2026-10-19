"use client";

import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/config/routes";
import { notify } from "@/lib/utils/notify";
import { AuthLink, AuthShell } from "./AuthShell";

export function VerifyEmailPanel({ email }: { email?: string }) {
  return (
    <AuthShell
      title="Verify your email"
      subtitle={email ? `We sent a link to ${email}.` : "We sent you a verification link."}
      footer={
        <>
          Wrong address? <AuthLink href={ROUTES.signUp}>Use a different email</AuthLink>
        </>
      }
    >
      <MailCheck className="text-maroon-600 mb-3 size-8" aria-hidden />
      <p className="text-sm">
        Open the link to finish setting up. Check spam if you cannot find it.
      </p>
      <div className="mt-5 flex flex-col gap-2">
        <Button variant="secondary" onClick={() => notify("Verification email sent again")}>
          Resend Email
        </Button>
        <Button asChild>
          <a href={ROUTES.signIn}>I Have Verified, Sign In</a>
        </Button>
      </div>
    </AuthShell>
  );
}
