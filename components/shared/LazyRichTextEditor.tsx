"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "./Skeletons";

/** TipTap is heavy: load it only when an editor is actually opened. */
export const LazyRichTextEditor = dynamic(() => import("./RichTextEditor"), {
  ssr: false,
  loading: () => <Skeleton className="h-24 w-full" />,
});
