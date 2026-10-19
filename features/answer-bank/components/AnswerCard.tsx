import { Card } from "@/components/ui/card";
import { FlaggedBadge, NotDraftedBadge, RehearsedBadge } from "@/components/shared/Badges";

export type AnswerStatus = "rehearsed" | "flagged" | "not-drafted";

interface Props {
  question: string;
  status: AnswerStatus;
  snippet?: string;
  critique?: string;
  onOpen?: () => void;
}

export function AnswerCard({ question, status, snippet, critique, onOpen }: Props) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold">{question}</h3>
        {status === "rehearsed" && <RehearsedBadge />}
        {status === "flagged" && <FlaggedBadge />}
        {status === "not-drafted" && <NotDraftedBadge />}
      </div>
      {snippet ? (
        <p className="text-navy-400 mt-2 line-clamp-2 text-sm">{snippet}</p>
      ) : (
        <p className="text-navy-400 mt-2 text-sm italic">No draft yet.</p>
      )}
      {critique && status === "flagged" && (
        <p className="bg-maroon-100 text-maroon-600 rounded-control mt-3 p-3 text-sm">{critique}</p>
      )}
      {onOpen && (
        <button
          type="button"
          onClick={onOpen}
          className="text-maroon-600 mt-3 min-h-11 text-sm font-semibold underline"
        >
          {status === "not-drafted" ? "Start Draft" : "Open Answer"}
        </button>
      )}
    </Card>
  );
}
