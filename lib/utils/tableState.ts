import type { SortingState } from "@tanstack/react-table";

/** URL `sort=field:dir` <-> TanStack sorting state. */
export function parseSort(value: string | null): SortingState {
  if (!value) return [];
  const [id, dir] = value.split(":");
  return id ? [{ id, desc: dir === "desc" }] : [];
}

export function formatSort(state: SortingState): string {
  const s = state[0];
  return s ? `${s.id}:${s.desc ? "desc" : "asc"}` : "";
}
