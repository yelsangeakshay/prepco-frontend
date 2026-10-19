import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OnboardingStep } from "@/features/onboarding/components/OnboardingSteps";
import { getScenario } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Onboarding" };

export default async function Page({ params }: { params: Promise<{ step: string }> }) {
  const { step } = await params;
  if (!["1", "2", "3"].includes(step)) notFound();
  const scenario = await getScenario();
  return (
    <OnboardingStep step={Number(step) as 1 | 2 | 3} lateJoiner={scenario === "late-joiner"} />
  );
}
