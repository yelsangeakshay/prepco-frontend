"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAnswer, getAnswers, patchAnswer } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/query-keys";
import { useApiReady } from "@/components/shell/Providers";
import type { AnswerDetail, PatchAnswerBody } from "../schemas";

export interface AnswerParams {
  status?: string;
  q?: string;
  page?: number;
  pageSize?: number;
}

export function useAnswers(params: AnswerParams) {
  const ready = useApiReady();
  return useQuery({
    queryKey: queryKeys.answers(params),
    queryFn: () => getAnswers(params),
    enabled: ready,
    placeholderData: (prev) => prev,
  });
}

export function useAnswer(id: string) {
  const ready = useApiReady();
  return useQuery({ queryKey: queryKeys.answer(id), queryFn: () => getAnswer(id), enabled: ready });
}

/** Flagging is cheap and reversible, so the detail view updates optimistically and rolls back on error. */
export function usePatchAnswer(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: PatchAnswerBody) => patchAnswer(id, body),
    onMutate: async (body) => {
      if (!body.status) return {};
      await qc.cancelQueries({ queryKey: queryKeys.answer(id) });
      const prev = qc.getQueryData<AnswerDetail>(queryKeys.answer(id));
      if (prev)
        qc.setQueryData<AnswerDetail>(queryKeys.answer(id), { ...prev, status: body.status });
      return { prev };
    },
    onError: (_e, _b, ctx) => {
      if (ctx?.prev) qc.setQueryData(queryKeys.answer(id), ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.answer(id) });
      qc.invalidateQueries({ queryKey: queryKeys.answersAll });
      qc.invalidateQueries({ queryKey: queryKeys.runway });
    },
  });
}
