"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCv,
  getCvVersions,
  lockCvVersion,
  patchBullet,
  requestRelock,
} from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/query-keys";
import { useApiReady } from "@/components/shell/Providers";

export function useCv() {
  const ready = useApiReady();
  return useQuery({ queryKey: queryKeys.cv, queryFn: getCv, enabled: ready });
}

export function useCvVersions() {
  const ready = useApiReady();
  return useQuery({ queryKey: queryKeys.cvVersions, queryFn: getCvVersions, enabled: ready });
}

export function usePatchBullet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) => patchBullet(id, text),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.cv }),
  });
}

export function useRequestRelock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: requestRelock,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.cv }),
  });
}

export function useLockVersion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: lockCvVersion,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.cv });
      qc.invalidateQueries({ queryKey: queryKeys.runway });
    },
  });
}
