"use client";

import { useQuery } from "@tanstack/react-query";
import { getFeedback, getFeedbackDetail } from "@/lib/api/endpoints/feedback";
import { queryKeys } from "@/lib/api/query-keys";
import { useApiReady } from "@/components/shell/Providers";

export function useFeedbackList(params: { page?: number; pageSize?: number } = {}) {
  const ready = useApiReady();
  return useQuery({
    queryKey: queryKeys.feedback(params),
    queryFn: () => getFeedback(params),
    enabled: ready,
  });
}

export function useFeedbackDetail(panelId: string) {
  const ready = useApiReady();
  return useQuery({
    queryKey: queryKeys.feedbackDetail(panelId),
    queryFn: () => getFeedbackDetail(panelId),
    enabled: ready,
  });
}
