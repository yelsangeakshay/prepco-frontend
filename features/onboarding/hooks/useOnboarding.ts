"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { getFreeSession, saveProfile, uploadCv } from "@/lib/api/endpoints/onboarding";
import { queryKeys } from "@/lib/api/query-keys";
import { useApiReady } from "@/components/shell/Providers";

export const useSaveProfile = () => useMutation({ mutationFn: saveProfile });
export const useUploadCv = () => useMutation({ mutationFn: uploadCv });

export function useFreeSession() {
  const ready = useApiReady();
  return useQuery({ queryKey: queryKeys.freeSession, queryFn: getFreeSession, enabled: ready });
}
