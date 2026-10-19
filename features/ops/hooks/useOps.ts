"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  decideApplication,
  decideRelock,
  excuseBooking,
  getOpsApplications,
  getOpsAssignments,
  getOpsBookings,
  getOpsCohort,
  getOpsLedger,
  getOpsPanelists,
  getOpsStudent,
  getOpsStudents,
  panelistAction,
  postAssignment,
} from "@/lib/api/endpoints/ops";
import { type ListParams } from "@/lib/api/endpoints/qs";
import { queryKeys } from "@/lib/api/query-keys";
import { useApiReady } from "@/components/shell/Providers";

const k = queryKeys.ops;

export function useCohort() {
  const ready = useApiReady();
  return useQuery({ queryKey: k.cohort, queryFn: getOpsCohort, enabled: ready });
}

export function useOpsStudents(params: ListParams) {
  const ready = useApiReady();
  return useQuery({
    queryKey: k.students(params),
    queryFn: () => getOpsStudents(params),
    enabled: ready,
    placeholderData: (prev) => prev,
  });
}

export function useOpsStudent(id: string) {
  const ready = useApiReady();
  return useQuery({
    queryKey: k.student(id),
    queryFn: () => getOpsStudent(id),
    enabled: ready,
    retry: false,
  });
}

/** Everything ops shows is derived from the same world, so any ops write refreshes all ops queries. */
function useInvalidateOps() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: k.all });
}

export function useRelockDecision(id: string) {
  const invalidate = useInvalidateOps();
  return useMutation({
    mutationFn: (decision: "approve" | "reject") => decideRelock(id, decision),
    onSuccess: invalidate,
  });
}

export function useOpsAssignments() {
  const ready = useApiReady();
  return useQuery({ queryKey: k.assignments, queryFn: getOpsAssignments, enabled: ready });
}

/** Assigning is not optimistic: the panelist may be taken between click and confirm. */
export function useAssign() {
  const invalidate = useInvalidateOps();
  return useMutation({ mutationFn: postAssignment, onSuccess: invalidate });
}

export function useOpsBookings(params: ListParams) {
  const ready = useApiReady();
  return useQuery({
    queryKey: k.bookings(params),
    queryFn: () => getOpsBookings(params),
    enabled: ready,
    placeholderData: (prev) => prev,
  });
}

export function useExcuse() {
  const invalidate = useInvalidateOps();
  return useMutation({ mutationFn: excuseBooking, onSuccess: invalidate });
}

export function useOpsLedger(params: ListParams) {
  const ready = useApiReady();
  return useQuery({
    queryKey: k.ledger(params),
    queryFn: () => getOpsLedger(params),
    enabled: ready,
    placeholderData: (prev) => prev,
  });
}

export function useOpsPanelists(params: ListParams) {
  const ready = useApiReady();
  return useQuery({
    queryKey: k.panelists(params),
    queryFn: () => getOpsPanelists(params),
    enabled: ready,
    placeholderData: (prev) => prev,
  });
}

export function usePanelistAction() {
  const invalidate = useInvalidateOps();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: "pause" | "resume" | "nudge" }) =>
      panelistAction(id, action),
    onSuccess: invalidate,
  });
}

export function useOpsApplications(status?: string) {
  const ready = useApiReady();
  return useQuery({
    queryKey: k.applications(status),
    queryFn: () => getOpsApplications(status),
    enabled: ready,
  });
}

export function useDecideApplication() {
  const invalidate = useInvalidateOps();
  return useMutation({
    mutationFn: ({ id, decision }: { id: string; decision: "approve" | "reject" }) =>
      decideApplication(id, decision),
    onSuccess: invalidate,
  });
}
