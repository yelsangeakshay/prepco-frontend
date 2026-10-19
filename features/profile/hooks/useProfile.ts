"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { changeTarget, getProfile, updateProfile } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/query-keys";
import { useApiReady } from "@/components/shell/Providers";

export function useProfile() {
  const ready = useApiReady();
  return useQuery({ queryKey: queryKeys.profile, queryFn: getProfile, enabled: ready });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.profile }),
  });
}

export function useChangeTarget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: changeTarget,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.profile });
      qc.invalidateQueries({ queryKey: queryKeys.answersAll });
      qc.invalidateQueries({ queryKey: queryKeys.runway });
      qc.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });
}
