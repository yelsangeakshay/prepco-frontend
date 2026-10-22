import { Badge } from "@/components/ui/badge";
import type { SessionStatus } from "../schemas";
import { statusTone } from "@/lib/status";

const MAP: Record<
  SessionStatus,
  { label: string; tone: React.ComponentProps<typeof Badge>["tone"] }
> = {
  upcoming: { label: "Booked", tone: statusTone("booked") },
  completed: { label: "Done", tone: statusTone("done") },
  cancelled: { label: "Cancelled", tone: statusTone("cancelled") },
  rescheduled: { label: "Moved", tone: statusTone("moved") },
  "no-show": { label: "Missed", tone: statusTone("missed") },
  unbooked: { label: "Pick a slot", tone: statusTone("pick a slot") },
  locked: { label: "Locked", tone: statusTone("locked") },
};

export function SessionStatusBadge({ status }: { status: SessionStatus }) {
  const m = MAP[status];
  return <Badge tone={m.tone}>{m.label}</Badge>;
}
