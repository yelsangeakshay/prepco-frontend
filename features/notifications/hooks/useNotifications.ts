"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getNotifications, markNotificationsRead } from "@/lib/api/endpoints/notifications";
import { queryKeys, staleTimes } from "@/lib/api/query-keys";
import { useApiReady } from "@/components/shell/Providers";
import type { MarkReadBody } from "../schemas";

type Data = Awaited<ReturnType<typeof getNotifications>>;

export function useNotifications() {
  const ready = useApiReady();
  return useQuery({
    queryKey: queryKeys.notifications,
    queryFn: getNotifications,
    staleTime: staleTimes.notifications,
    refetchOnWindowFocus: true,
    enabled: ready,
  });
}

/** Optimistic: marking read is cheap and reversible. */
export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: MarkReadBody) => markNotificationsRead(body),
    onMutate: async (body) => {
      await qc.cancelQueries({ queryKey: queryKeys.notifications });
      const prev = qc.getQueryData<Data>(queryKeys.notifications);
      if (prev) {
        const items = prev.items.map((n) =>
          body.all || body.ids?.includes(n.id) ? { ...n, read: true } : n,
        );
        qc.setQueryData<Data>(queryKeys.notifications, {
          items,
          unread: items.filter((n) => !n.read).length,
        });
      }
      return { prev };
    },
    onError: (_e, _b, ctx) => {
      if (ctx?.prev) qc.setQueryData(queryKeys.notifications, ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.notifications }),
  });
}
