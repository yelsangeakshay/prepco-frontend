import type { BadgeProps } from "@/components/ui/badge";

/**
 * One meaning per colour, app wide:
 *   done     green         finished, sent, paid, healthy
 *   action   maroon (soft) the person looking at it has something to do, or something went wrong
 *   upcoming neutral       booked, scheduled, not started, inactive
 *   premium  gold          paid-tier labels and what a tier unlocks
 * Features pass their own status word to `statusTone` instead of choosing a tone themselves.
 */
export type StatusTone = NonNullable<BadgeProps["tone"]>;

// Words are lower case and separated by "|". Kept as strings: this ships in the first load of many routes.
const GROUPS: [StatusTone, string][] = [
  // done
  [
    "green",
    "done|completed|used|paid|active|ready|good|strong|scored|rehearsed|feedback sent|confirmed",
  ],
  // action needed, or gone wrong
  [
    "maroonSoft",
    "flagged|needs scoring|needs work|needs panelist|needs-attention|unassigned|no-show|missed|refunded|feedback due|tonight|pick a slot",
  ],
  // upcoming or inactive (also the fallback)
  [
    "neutral",
    "upcoming|booked|scheduled|book|later|watch|okay|almost there|not-drafted|not booked|unbooked|cancelled|moved|locked|credit|none|basic",
  ],
  // premium
  ["goldSoft", "premium|on-placing"],
  ["gold", "elite"],
];

const TONE_BY_STATUS = new Map<string, StatusTone>(
  GROUPS.flatMap(([tone, words]) => words.split("|").map((w): [string, StatusTone] => [w, tone])),
);

/** Badge tone for a status word (case insensitive). Unknown words are neutral. */
export function statusTone(status: string): StatusTone {
  return TONE_BY_STATUS.get(status.trim().toLowerCase()) ?? "neutral";
}
