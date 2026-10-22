import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { ROUTES } from "@/lib/config/routes";
import { formatSession } from "@/lib/utils/dates";
import type { PanelItem } from "../schemas";
import { statusTone } from "@/lib/status";

/** One panel on Arjun's lists: who, when, and the next action. */
export function PanelRow({ item, compact }: { item: PanelItem; compact?: boolean }) {
  return (
    <Card
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        compact && "p-3",
      )}
    >
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-2 font-semibold">
          {item.studentName}
          {item.status === "awaiting-score" && (
            <Badge tone={statusTone("needs scoring")}>Needs scoring</Badge>
          )}
          {item.status === "scored" && (
            <Badge tone={statusTone(item.verdict ?? "scored")}>{item.verdict ?? "Scored"}</Badge>
          )}
        </p>
        <p className="text-navy-400 text-sm">
          {item.title} · {item.college}
        </p>
        <p className="text-sm">{formatSession(item.startsAt)}</p>
      </div>
      <div className="flex gap-2">
        {item.status === "upcoming" && (
          <>
            <Button asChild size="sm" variant="secondary">
              <Link href={ROUTES.panelist.brief(item.sessionId)}>View brief</Link>
            </Button>
            <Button asChild size="sm">
              <Link href={ROUTES.panelist.scoringSession(item.sessionId)}>Start scoring</Link>
            </Button>
          </>
        )}
        {item.status === "awaiting-score" && (
          <Button asChild size="sm">
            <Link href={ROUTES.panelist.scoringSession(item.sessionId)}>Start scoring</Link>
          </Button>
        )}
      </div>
    </Card>
  );
}
