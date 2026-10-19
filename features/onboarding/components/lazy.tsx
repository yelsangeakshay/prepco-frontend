"use client";

import dynamic from "next/dynamic";
import { FormSkeleton } from "@/components/shared/Skeletons";

// React Hook Form + Zod load after first paint; see features/auth/components/lazy.tsx.
export const OnboardingStepLazy = dynamic(
  () => import("./OnboardingSteps").then((m) => m.OnboardingStep),
  { ssr: false, loading: () => <FormSkeleton /> },
);
