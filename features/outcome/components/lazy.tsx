"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/shared/Skeletons";

export const PlacedFormLazy = dynamic(() => import("./PlacedForm"), {
  ssr: false,
  loading: () => <Skeleton className="h-56 w-full" />,
});
