"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface Task {
  id: string;
  label: string;
  hint?: string;
  done: boolean;
}

interface Props {
  tasks: Task[];
  onToggle?: (id: string, done: boolean) => void;
}

export function TaskList({ tasks, onToggle }: Props) {
  return (
    <ul className="divide-line divide-y">
      {tasks.map((t) => (
        <li key={t.id}>
          <button
            type="button"
            role="checkbox"
            aria-checked={t.done}
            onClick={() => onToggle?.(t.id, !t.done)}
            className="flex min-h-12 w-full items-start gap-3 py-3 text-left"
          >
            <span
              className={cn(
                "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border-2",
                t.done ? "border-green-600 bg-green-600 text-white" : "border-line bg-white",
              )}
            >
              {t.done && <Check className="size-3.5" aria-hidden />}
            </span>
            <span>
              <span className="block text-base font-semibold">{t.label}</span>
              {t.hint && <span className="text-navy-400 block text-sm">{t.hint}</span>}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
