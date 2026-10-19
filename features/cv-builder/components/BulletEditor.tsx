"use client";

import { useState } from "react";
import { Check, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LazyRichTextEditor } from "@/components/shared/LazyRichTextEditor";
import { cn } from "@/lib/utils/cn";
import { usePatchBullet } from "../hooks/useCv";
import { scoreBulletText, type Bullet } from "../schemas";

export function TestChips({
  hasDecision,
  hasNumber,
  hasTradeoff,
}: Pick<Bullet, "hasDecision" | "hasNumber" | "hasTradeoff">) {
  const items = [
    ["Decision", hasDecision],
    ["Number", hasNumber],
    ["Trade-off", hasTradeoff],
  ] as const;
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Panel tests">
      {items.map(([label, ok]) => (
        <li
          key={label}
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
            ok ? "bg-green-100 text-green-600" : "bg-cream-soft text-navy-400",
          )}
        >
          {ok ? <Check className="size-3" aria-hidden /> : <Minus className="size-3" aria-hidden />}
          {label}
          <span className="sr-only">{ok ? " passed" : " missing"}</span>
        </li>
      ))}
    </ul>
  );
}

/** One CV bullet: read, or edit with a live preview of the three tests. */
export function BulletEditor({ bullet }: { bullet: Bullet }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(bullet.text);
  const patch = usePatchBullet();
  const live = scoreBulletText(text);

  const save = () => patch.mutate({ id: bullet.id, text }, { onSuccess: () => setEditing(false) });

  return (
    <div className="rounded-card border-line border bg-white p-4">
      {editing ? (
        <div className="space-y-3">
          <LazyRichTextEditor
            value={text}
            onChange={setText}
            label={`Edit bullet: ${bullet.text.slice(0, 40)}`}
            minHeight={64}
          />
          <TestChips {...live} />
          {patch.isError && (
            <p role="alert" className="text-maroon-600 text-sm">
              We could not save this bullet. Please try again.
            </p>
          )}
          <div className="flex gap-2">
            <Button size="sm" onClick={save} disabled={patch.isPending || !text.trim()}>
              {patch.isPending ? "Saving…" : "Save Bullet"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setText(bullet.text);
                setEditing(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm">{bullet.text}</p>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <TestChips {...bullet} />
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-maroon-600 min-h-11 text-sm font-semibold underline"
            >
              Edit<span className="sr-only"> bullet: {bullet.text.slice(0, 40)}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
