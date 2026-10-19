"use client";

import { useRef } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { EmptyState } from "./EmptyState";
import { ErrorCard } from "./ErrorCard";
import { Skeleton } from "./Skeletons";

/** Rows above this are virtualised. */
export const VIRTUALISE_ABOVE = 200;
const ROW_HEIGHT = 52;

interface Props<T> {
  columns: ColumnDef<T, unknown>[];
  data: T[];
  /** Server-side paging, driven by URL state. */
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  sort?: SortingState;
  onSortChange?: (sort: SortingState) => void;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyBody?: string;
  getRowId?: (row: T) => string;
  onRowClick?: (row: T) => void;
  caption: string;
}

export function DataTable<T>({
  columns,
  data,
  total,
  page,
  pageSize,
  onPageChange,
  sort = [],
  onSortChange,
  loading,
  error,
  onRetry,
  emptyTitle = "Nothing here yet",
  emptyBody,
  getRowId,
  onRowClick,
  caption,
}: Props<T>) {
  const table = useReactTable({
    data,
    columns,
    getRowId: getRowId ? (row) => getRowId(row) : undefined,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
    state: { sorting: sort },
    onSortingChange: (u) => onSortChange?.(typeof u === "function" ? u(sort) : u),
  });

  const rows = table.getRowModel().rows;
  const virtual = rows.length > VIRTUALISE_ABOVE;
  const scrollRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: virtual ? rows.length : 0,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  });

  if (error) return <ErrorCard onRetry={onRetry} />;
  if (loading) {
    return (
      <div role="status" aria-label="Loading table" className="space-y-2">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }
  if (rows.length === 0) return <EmptyState title={emptyTitle} body={emptyBody} />;

  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const items = virtual
    ? virtualizer.getVirtualItems()
    : rows.map((_, i) => ({ index: i, start: 0 }));
  const padTop = virtual && items.length ? (items[0]?.start ?? 0) : 0;
  const padBottom =
    virtual && items.length
      ? virtualizer.getTotalSize() - (items.at(-1)?.start ?? 0) - ROW_HEIGHT
      : 0;

  return (
    <div className="rounded-card border-line overflow-hidden border bg-white">
      <div ref={scrollRef} className={cn("overflow-auto", virtual && "max-h-[640px]")}>
        <table className="w-full text-left text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead className="bg-cream-soft sticky top-0 z-10">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => {
                  const dir = h.column.getIsSorted();
                  const sortable = h.column.getCanSort();
                  return (
                    <th
                      key={h.id}
                      scope="col"
                      aria-sort={
                        dir === "asc" ? "ascending" : dir === "desc" ? "descending" : undefined
                      }
                      className="text-navy-400 px-4 py-3 text-xs font-semibold tracking-wider uppercase"
                    >
                      {sortable ? (
                        <button
                          type="button"
                          onClick={h.column.getToggleSortingHandler()}
                          className="inline-flex min-h-8 items-center gap-1 uppercase"
                        >
                          {flexRender(h.column.columnDef.header, h.getContext())}
                          {dir === "asc" && <ArrowUp className="size-3" aria-hidden />}
                          {dir === "desc" && <ArrowDown className="size-3" aria-hidden />}
                        </button>
                      ) : (
                        flexRender(h.column.columnDef.header, h.getContext())
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {padTop > 0 && (
              <tr aria-hidden style={{ height: padTop }}>
                <td />
              </tr>
            )}
            {items.map((item) => {
              const row = rows[item.index]!;
              return (
                <tr
                  key={row.id}
                  style={virtual ? { height: ROW_HEIGHT } : undefined}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  className={cn(
                    "border-line border-t",
                    onRowClick && "hover:bg-cream cursor-pointer",
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              );
            })}
            {padBottom > 0 && (
              <tr aria-hidden style={{ height: padBottom }}>
                <td />
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="border-line flex items-center justify-between border-t px-4 py-2 text-sm">
        <span className="text-navy-400">
          Page {page} of {pageCount} · {total.toLocaleString("en-IN")} total
        </span>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            Previous
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= pageCount}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
