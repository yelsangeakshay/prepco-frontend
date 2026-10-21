"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCaseTrack,
  getJourney,
  getQuickSwitch,
  getQuickSwitchDigest,
  saveQuickSwitchPrefs,
  toggleQuickSwitchSaved,
} from "@/lib/api/endpoints/journey";
import type { QuickSwitchPrefs } from "../schemas";
import { queryKeys } from "@/lib/api/query-keys";
import { useApiReady } from "@/components/shell/Providers";

export function useJourney() {
  const ready = useApiReady();
  return useQuery({ queryKey: queryKeys.journey, queryFn: getJourney, enabled: ready });
}

export function useQuickSwitchDigest() {
  const ready = useApiReady();
  return useQuery({
    queryKey: queryKeys.quickSwitchDigest,
    queryFn: getQuickSwitchDigest,
    enabled: ready,
  });
}

export function useSaveQuickSwitchPrefs() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: QuickSwitchPrefs) => saveQuickSwitchPrefs(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.quickSwitchDigest }),
  });
}

export function useToggleSavedListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => toggleQuickSwitchSaved(id),
    onSuccess: (data) => qc.setQueryData(queryKeys.quickSwitchDigest, data),
  });
}

export function useQuickSwitch(to: string | null) {
  const ready = useApiReady();
  return useQuery({
    queryKey: queryKeys.quickSwitch(to ?? ""),
    queryFn: () => getQuickSwitch(to!),
    enabled: ready && !!to,
  });
}

export function useCaseTrack() {
  const ready = useApiReady();
  return useQuery({
    queryKey: queryKeys.caseTrack,
    queryFn: getCaseTrack,
    enabled: ready,
  });
}
