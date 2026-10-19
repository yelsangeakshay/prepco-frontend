import type { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/shell/Logo";
import { Card } from "@/components/ui/card";
import { ROUTES } from "@/lib/config/routes";

interface Props {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthShell({ title, subtitle, children, footer }: Props) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4 py-8">
      <Logo href={ROUTES.signIn} className="mb-6 self-center" />
      <Card variant="feature">
        <h1 className="font-display text-2xl font-bold">{title}</h1>
        {subtitle && <p className="text-navy-400 mt-1 text-sm">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </Card>
      {footer && <p className="text-navy-400 mt-4 text-center text-sm">{footer}</p>}
    </main>
  );
}

export function AuthLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="text-maroon-600 font-semibold underline">
      {children}
    </Link>
  );
}

export function FormAlert({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="bg-maroon-100 text-maroon-600 rounded-control mb-4 p-3 text-sm">
      {children}
    </p>
  );
}

/** Placeholder while a lazily loaded auth form arrives. */
export function AuthSkeleton() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4 py-8">
      <div
        role="status"
        aria-label="Loading"
        className="bg-cream-soft h-80 animate-pulse rounded-2xl"
      />
    </main>
  );
}
