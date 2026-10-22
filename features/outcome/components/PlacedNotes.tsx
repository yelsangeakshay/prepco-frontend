import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/** Lines under the placed card (e07.png): what stays with the student, and the open decision on unused sessions. */
export function PlacedNotes() {
  return (
    <ul className="space-y-3">
      <li className="flex items-start gap-3">
        <Check className="mt-0.5 size-5 shrink-0 text-green-600" aria-hidden />
        Your CV, answer bank and feedback stay yours, read-only.
      </li>
      <li className="flex flex-wrap items-center gap-3">
        <Check className="size-5 shrink-0 text-green-600" aria-hidden />
        <span>Unused sessions:</span>
        <Badge tone="goldSoft">Decision needed</Badge>
      </li>
    </ul>
  );
}
