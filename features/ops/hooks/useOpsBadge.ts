"use client";

import { useQuery } from "@tanstack/react-query";
import { getOpsBadges } from "@/lib/api/endpoints/badges";
import { queryKeys } from "@/lib/api/query-keys";
import { useApiReady } from "@/components/shell/Providers";

/** Live count of panels waiting for a panelist (sidebar badge). Only runs for ops. */
export function useOpsBadge(enabled: boolean) {
  const ready = useApiReady();
  return useQuery({
    queryKey: queryKeys.ops.badges,
    queryFn: getOpsBadges,
    enabled: ready && enabled,
    staleTime: 15_000,
  });
}
