import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ROUTES } from "@/lib/config/routes";
import { formatSession } from "@/lib/utils/dates";
import type { PanelItem } from "../schemas";

/** One panel on Arjun's lists: who, when, and the next action. */
export function PanelRow({ item }: { item: PanelItem }) {
  return (
    <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-2 font-semibold">
          {item.studentName}
          {item.status === "awaiting-score" && <Badge tone="maroonSoft">Needs scoring</Badge>}
          {item.status === "scored" && <Badge tone="green">{item.verdict ?? "Scored"}</Badge>}
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
              <Link href={ROUTES.panelist.brief(item.sessionId)}>View Brief</Link>
            </Button>
            <Button asChild size="sm">
              <Link href={ROUTES.panelist.scoringSession(item.sessionId)}>Start Scoring</Link>
            </Button>
          </>
        )}
        {item.status === "awaiting-score" && (
          <Button asChild size="sm">
            <Link href={ROUTES.panelist.scoringSession(item.sessionId)}>Score Now</Link>
          </Button>
        )}
      </div>
    </Card>
  );
}
