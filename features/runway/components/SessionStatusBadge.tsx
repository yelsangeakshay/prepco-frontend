import { Badge } from "@/components/ui/badge";
import type { SessionStatus } from "../schemas";

const MAP: Record<
  SessionStatus,
  { label: string; tone: React.ComponentProps<typeof Badge>["tone"] }
> = {
  upcoming: { label: "Booked", tone: "navy" },
  completed: { label: "Done", tone: "green" },
  cancelled: { label: "Cancelled", tone: "maroonSoft" },
  rescheduled: { label: "Moved", tone: "maroonSoft" },
  "no-show": { label: "Missed", tone: "maroonSoft" },
  unbooked: { label: "Pick a slot", tone: "maroon" },
  locked: { label: "Locked", tone: "neutral" },
};

export function SessionStatusBadge({ status }: { status: SessionStatus }) {
  const m = MAP[status];
  return <Badge tone={m.tone}>{m.label}</Badge>;
}
