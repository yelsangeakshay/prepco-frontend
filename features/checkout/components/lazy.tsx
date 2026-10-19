"use client";

import dynamic from "next/dynamic";
import { FormSkeleton } from "@/components/shared/Skeletons";

export const WaitlistViewLazy = dynamic(
  () => import("./WaitlistView").then((m) => m.WaitlistView),
  {
    ssr: false,
    loading: () => <FormSkeleton />,
  },
);
