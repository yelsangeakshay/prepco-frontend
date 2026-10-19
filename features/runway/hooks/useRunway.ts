"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  bookSession,
  cancelSession,
  getRunway,
  getSession,
  getSessionSlots,
  getSessions,
  rescheduleSession,
} from "@/lib/api/endpoints";
import { queryKeys, staleTimes } from "@/lib/api/query-keys";
import { useApiReady } from "@/components/shell/Providers";

export function useRunway() {
  const ready = useApiReady();
  return useQuery({
    queryKey: queryKeys.runway,
    queryFn: getRunway,
    staleTime: staleTimes.runway,
    enabled: ready,
  });
}

export function useSessions(params: { page?: number; pageSize?: number } = {}) {
  const ready = useApiReady();
  return useQuery({
    queryKey: queryKeys.sessions(params),
    queryFn: () => getSessions(params),
    staleTime: staleTimes.sessions,
    enabled: ready,
  });
}

export function useSession(id: string) {
  const ready = useApiReady();
  return useQuery({
    queryKey: queryKeys.session(id),
    queryFn: () => getSession(id),
    staleTime: staleTimes.sessions,
    enabled: ready,
  });
}

export function useSessionSlots(id: string, enabled = true) {
  const ready = useApiReady();
  return useQuery({
    queryKey: queryKeys.sessionSlots(id),
    queryFn: () => getSessionSlots(id),
    enabled: ready && enabled,
    staleTime: 0,
  });
}

function useInvalidateRunway() {
  const qc = useQueryClient();
  return () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: queryKeys.runway }),
      qc.invalidateQueries({ queryKey: queryKeys.sessionsAll }),
      qc.invalidateQueries({ queryKey: ["session"] }),
    ]);
}

/** Never optimistic: a slot can be taken between click and confirm. */
export function useBookSession(id: string) {
  const invalidate = useInvalidateRunway();
  return useMutation({
    mutationFn: (slotId: string) => bookSession(id, slotId),
    onSuccess: invalidate,
    onError: () => {
      // Slot list is stale after a "slot taken" error.
    },
  });
}

export function useRescheduleSession(id: string) {
  const invalidate = useInvalidateRunway();
  return useMutation({
    mutationFn: (slotId: string) => rescheduleSession(id, slotId),
    onSuccess: invalidate,
  });
}

export function useCancelSession(id: string) {
  const invalidate = useInvalidateRunway();
  return useMutation({ mutationFn: () => cancelSession(id), onSuccess: invalidate });
}
