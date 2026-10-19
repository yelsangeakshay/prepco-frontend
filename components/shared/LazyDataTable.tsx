"use client";

import dynamic from "next/dynamic";
import type { DataTable as DataTableType } from "./DataTable";
import { Skeleton } from "./Skeletons";

/** TanStack Table + Virtual are ~25 kB: keep them out of the first load of list screens. */
export const LazyDataTable = dynamic(() => import("./DataTable").then((m) => m.DataTable), {
  ssr: false,
  loading: () => (
    <div role="status" aria-label="Loading table" className="space-y-2">
      {Array.from({ length: 6 }, (_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  ),
}) as unknown as typeof DataTableType;
