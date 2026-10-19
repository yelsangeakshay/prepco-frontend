"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAvailability,
  getBrief,
  getPanelBriefs,
  getPanelistProfile,
  getPanelistToday,
  getScoringList,
  postApplication,
  postScore,
  putAvailability,
  putPanelistProfile,
} from "@/lib/api/endpoints/panelist";
import { queryKeys } from "@/lib/api/query-keys";
import { useApiReady } from "@/components/shell/Providers";
import type { ScoreBody } from "../schemas";

const k = queryKeys.panelist;

export function usePanelistToday() {
  const ready = useApiReady();
  return useQuery({ queryKey: k.today, queryFn: getPanelistToday, enabled: ready });
}

export function usePanelBriefs() {
  const ready = useApiReady();
  return useQuery({ queryKey: k.briefs, queryFn: getPanelBriefs, enabled: ready });
}

export function useBrief(sessionId: string) {
  const ready = useApiReady();
  return useQuery({
    queryKey: k.brief(sessionId),
    queryFn: () => getBrief(sessionId),
    enabled: ready,
    retry: false,
  });
}

export function useScoringList() {
  const ready = useApiReady();
  return useQuery({ queryKey: k.scoring, queryFn: getScoringList, enabled: ready });
}

/** Scoring sends feedback to a student, so it is never optimistic. */
export function useSubmitScore(sessionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ScoreBody) => postScore(sessionId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["panelist"] });
      qc.invalidateQueries({ queryKey: queryKeys.ops.all });
    },
  });
}

export function useAvailability() {
  const ready = useApiReady();
  return useQuery({ queryKey: k.availability, queryFn: getAvailability, enabled: ready });
}

export function useSaveAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: putAvailability,
    onSuccess: (data) => {
      qc.setQueryData(k.availability, data);
      qc.invalidateQueries({ queryKey: queryKeys.ops.assignments });
    },
  });
}

export const useSubmitApplication = () => useMutation({ mutationFn: postApplication });

export function usePanelistProfile() {
  const ready = useApiReady();
  return useQuery({ queryKey: k.profile, queryFn: getPanelistProfile, enabled: ready });
}

export function useUpdatePanelistProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: putPanelistProfile,
    onSuccess: () => qc.invalidateQueries({ queryKey: k.profile }),
  });
}
