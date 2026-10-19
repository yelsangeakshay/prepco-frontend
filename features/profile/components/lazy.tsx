"use client";

import dynamic from "next/dynamic";
import { FormSkeleton, Skeleton } from "@/components/shared/Skeletons";

export const ChangeTargetViewLazy = dynamic(
  () => import("./ChangeTargetView").then((m) => m.ChangeTargetView),
  { ssr: false, loading: () => <FormSkeleton /> },
);

export const ProfileDetailsFormLazy = dynamic(() => import("./ProfileDetailsForm"), {
  ssr: false,
  loading: () => <Skeleton className="h-64 w-full" />,
});
