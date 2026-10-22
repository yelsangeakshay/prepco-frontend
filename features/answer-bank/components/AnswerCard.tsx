import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import type { AnswerSummary } from "../schemas";
import { statusTone } from "@/lib/status";

export type AnswerStatus = AnswerSummary["status"];

const LABEL: Record<AnswerStatus, string> = {
  rehearsed: "Rehearsed",
  flagged: "Flagged",
  "not-drafted": "Not drafted",
};

interface Props {
  question: string;
  status: AnswerStatus;
  /** The row that is open on the right (desktop) or highlighted (phone). */
  selected?: boolean;
  /** The panel note, shown on phones under a selected flagged row; desktop shows it in the editor. */
  critique?: string | null;
  noteTags?: AnswerSummary["noteTags"];
}

/** One row of the answer list (s08.png): the question and its status. */
export function AnswerCard({ question, status, selected, critique, noteTags = [] }: Props) {
  return (
    <div
      className={cn(
        "rounded-card min-h-14 border bg-white p-4 transition-colors",
        selected ? "border-maroon-600 border-2" : "border-line hover:bg-cream-soft",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className={cn("text-base leading-snug", selected && "font-semibold")}>
          {question}
        </span>
        <Badge tone={statusTone(status)} className="shrink-0">
          {LABEL[status]}
        </Badge>
      </div>
      {selected && status === "flagged" && critique && (
        <div className="mt-2 lg:hidden">
          <p className="text-maroon-600 text-sm">{critique}</p>
          <ul aria-label="Parts the note is about" className="mt-2 flex flex-wrap gap-2">
            {noteTags.map((t) => (
              <li
                key={t}
                className="bg-cream-soft text-navy-900 rounded-full px-3 py-1 text-xs font-bold tracking-wider uppercase"
              >
                {t}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
