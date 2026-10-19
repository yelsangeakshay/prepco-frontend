import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { AuthShell, AuthLink } from "@/features/auth/components/AuthShell";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/config/routes";

export function ApplicationSubmitted() {
  return (
    <AuthShell
      title="Application received"
      subtitle="Thank you for offering your time."
      footer={<AuthLink href={ROUTES.signIn}>Back to sign in</AuthLink>}
    >
      <CheckCircle2 className="mb-3 size-10 text-green-600" aria-hidden />
      <p className="text-sm">
        Our team reviews applications weekly. If you are a fit we will email you a link to set your
        availability.
      </p>
      <Button asChild variant="secondary" className="mt-5 w-full">
        <Link href={ROUTES.signIn}>Done</Link>
      </Button>
    </AuthShell>
  );
}
