export type ListParams = Record<string, string | number | undefined | null>;

/** Query string for list endpoints; empty values are dropped. */
export const qs = (params: ListParams) => {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params))
    if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
  const s = q.toString();
  return s ? `?${s}` : "";
};
