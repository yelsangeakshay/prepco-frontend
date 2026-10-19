import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OnboardingStepLazy } from "@/features/onboarding/components/lazy";
import { getScenario } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Onboarding" };

export default async function Page({ params }: { params: Promise<{ step: string }> }) {
  const { step } = await params;
  if (!["1", "2", "3"].includes(step)) notFound();
  const scenario = await getScenario();
  return (
    <OnboardingStepLazy step={Number(step) as 1 | 2 | 3} lateJoiner={scenario === "late-joiner"} />
  );
}
