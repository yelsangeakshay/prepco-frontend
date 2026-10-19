import { Card } from "@/components/ui/card";
import { ScoreBar } from "@/components/shared/ScoreBar";

interface Props {
  panelist: string;
  role: string;
  when: string;
  verdict: string;
  note: string;
  scores?: { label: string; value: number }[];
}

export function FeedbackNote({ panelist, role, when, verdict, note, scores }: Props) {
  return (
    <Card variant="feature">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold">{panelist}</p>
          <p className="text-navy-400 text-xs">
            {role} · {when}
          </p>
        </div>
        <span className="bg-cream-soft rounded-full px-3 py-1 text-xs font-semibold">
          {verdict}
        </span>
      </div>
      <blockquote className="font-display border-gold-500 mt-4 border-l-4 pl-4 text-lg leading-snug">
        {note}
      </blockquote>
      {scores && scores.length > 0 && (
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {scores.map((s) => (
            <ScoreBar key={s.label} {...s} />
          ))}
        </div>
      )}
    </Card>
  );
}
