"use client";

import { useQuery } from "@tanstack/react-query";
import { getCaseTrack, getJourney, getQuickSwitch } from "@/lib/api/endpoints/journey";
import { queryKeys } from "@/lib/api/query-keys";
import { useApiReady } from "@/components/shell/Providers";

export function useJourney() {
  const ready = useApiReady();
  return useQuery({ queryKey: queryKeys.journey, queryFn: getJourney, enabled: ready });
}

export function useQuickSwitch(to: string | null) {
  const ready = useApiReady();
  return useQuery({
    queryKey: queryKeys.quickSwitch(to ?? ""),
    queryFn: () => getQuickSwitch(to!),
    enabled: ready && !!to,
  });
}

/** 403 `elite_only` is an expected answer, not a failure worth retrying. */
export function useCaseTrack() {
  const ready = useApiReady();
  return useQuery({
    queryKey: queryKeys.caseTrack,
    queryFn: getCaseTrack,
    enabled: ready,
    retry: false,
  });
}
