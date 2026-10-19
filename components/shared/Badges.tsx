import { Check, Flag, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/** Named badges from the cover sheet. */
export const RehearsedBadge = () => (
  <Badge tone="green">
    <Check className="size-3" aria-hidden /> Rehearsed
  </Badge>
);
export const FlaggedBadge = () => (
  <Badge tone="maroonSoft">
    <Flag className="size-3" aria-hidden /> Flagged
  </Badge>
);
export const NotDraftedBadge = () => <Badge tone="neutral">Not drafted</Badge>;
export const LockedVersionBadge = ({ version = "V4" }: { version?: string }) => (
  <Badge tone="navy">
    <Lock className="size-3" aria-hidden /> {version} · Locked
  </Badge>
);
export const MostChosenBadge = () => <Badge tone="maroon">Most chosen</Badge>;
export const EliteBadge = () => <Badge tone="gold">Elite</Badge>;
export const NeedWorkBadge = ({ count }: { count: number }) => (
  <Badge tone="maroonSoft">{count} need work</Badge>
);
export const Day0Badge = () => <Badge tone="gold">Day 0</Badge>;
export const ProposedBadge = () => <Badge tone="outline">Proposed</Badge>;
export const SampleDataBadge = () => <Badge tone="neutral">Sample data</Badge>;
