"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { buyTopUp, getBilling, getUpgradeQuote, postUpgrade } from "@/lib/api/endpoints/billing";
import { queryKeys } from "@/lib/api/query-keys";
import { useApiReady } from "@/components/shell/Providers";

export function useBilling() {
  const ready = useApiReady();
  return useQuery({ queryKey: queryKeys.billing, queryFn: getBilling, enabled: ready });
}

export function useUpgradeQuote() {
  const ready = useApiReady();
  return useQuery({
    queryKey: queryKeys.upgradeQuote,
    queryFn: getUpgradeQuote,
    enabled: ready,
    retry: false,
  });
}

/** Money moves here, so never optimistic. A top-up changes the upgrade quote too. */
export function useBuyTopUp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: buyTopUp,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.billing }),
  });
}

/** Money moves here, so never optimistic. */
export function useUpgrade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: postUpgrade,
    onSuccess: (r) => {
      if (r.status !== "paid") return;
      qc.invalidateQueries({ queryKey: queryKeys.billing });
      qc.invalidateQueries({ queryKey: queryKeys.caseTrack });
      qc.invalidateQueries({ queryKey: queryKeys.runway });
      qc.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });
}
