"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { getPlans, postCheckout, postWaitlist } from "@/lib/api/endpoints/plans";
import { queryKeys, staleTimes } from "@/lib/api/query-keys";
import { useApiReady } from "@/components/shell/Providers";
import type { Track } from "../schemas";

export function usePlans(track: Track = "finals") {
  const ready = useApiReady();
  return useQuery({
    queryKey: [...queryKeys.plans, track],
    queryFn: () => getPlans(track),
    staleTime: staleTimes.plans,
    enabled: ready,
  });
}

export const useCheckout = () => useMutation({ mutationFn: postCheckout });
export const useJoinWaitlist = () => useMutation({ mutationFn: postWaitlist });
