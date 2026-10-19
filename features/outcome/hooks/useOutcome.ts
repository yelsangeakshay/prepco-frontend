"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getOutcome, postOutcome } from "@/lib/api/endpoints/outcome";
import { queryKeys } from "@/lib/api/query-keys";
import { useApiReady } from "@/components/shell/Providers";

export function useOutcome() {
  const ready = useApiReady();
  return useQuery({ queryKey: queryKeys.outcome, queryFn: getOutcome, enabled: ready });
}

export function usePostOutcome() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: postOutcome,
    onSuccess: (data) => qc.setQueryData(queryKeys.outcome, data),
  });
}
