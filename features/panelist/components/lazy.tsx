"use client";

import dynamic from "next/dynamic";
import { FormSkeleton, Skeleton } from "@/components/shared/Skeletons";

export const ApplyFormLazy = dynamic(() => import("./ApplyForm").then((m) => m.ApplyForm), {
  ssr: false,
  loading: () => <FormSkeleton />,
});

export const PanelistProfileFormLazy = dynamic(() => import("./PanelistProfileForm"), {
  ssr: false,
  loading: () => <Skeleton className="h-64 w-full" />,
});

export const ScoringFormLazy = dynamic(
  () => import("../scoring/components/ScoringForm").then((m) => m.ScoringForm),
  { ssr: false, loading: () => <Skeleton className="h-96 w-full" /> },
);
