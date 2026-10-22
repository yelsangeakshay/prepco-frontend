"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorCard } from "@/components/shared/ErrorCard";
import { PageSkeleton } from "@/components/shared/Skeletons";
import { usePlans } from "@/features/plans/hooks/usePlans";
import { ROUTES } from "@/lib/config/routes";
import { CheckoutPanel } from "./CheckoutPanel";

/** E4 checkout page for one plan: the same checkout section as S4. */
export function CheckoutView({ planId }: { planId: string }) {
  const plans = usePlans();

  if (plans.isPending) return <PageSkeleton />;
  if (plans.isError || !plans.data) return <ErrorCard onRetry={() => plans.refetch()} />;

  const plan = plans.data.items.find((p) => p.id === planId);
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-8">
      <h1 className="font-display text-3xl font-bold md:text-[40px]">Checkout</h1>
      {plan ? (
        <CheckoutPanel plan={plan} track={plans.data.track} />
      ) : (
        <Card>
          <p className="font-semibold">We could not find that plan.</p>
          <Button asChild className="mt-4">
            <Link href={ROUTES.student.plans}>See plans</Link>
          </Button>
        </Card>
      )}
    </div>
  );
}
