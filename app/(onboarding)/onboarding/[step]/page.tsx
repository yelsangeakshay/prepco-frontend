import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { OnboardingStepLazy } from "@/features/onboarding/components/lazy";
import { getScenario } from "@/lib/auth/session";
import { ROUTES } from "@/lib/config/routes";

export const metadata: Metadata = { title: "Onboarding" };

export default async function Page({ params }: { params: Promise<{ step: string }> }) {
  const { step } = await params;
  if (!["1", "2", "3"].includes(step)) notFound();
  // Step 3 is the CV upload, which has its own route.
  if (step === "3") redirect(ROUTES.student.onboardingCv);
  const scenario = await getScenario();
  return (
    <OnboardingStepLazy step={Number(step) as 1 | 2} lateJoiner={scenario === "late-joiner"} />
  );
}
