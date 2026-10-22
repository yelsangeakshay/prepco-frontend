import { ProgressBar } from "./ProgressBar";

/** Labelled score, e.g. "Impact 88". */
export function ScoreBar({
  label,
  value,
  max = 100,
}: {
  label: string;
  value: number;
  max?: number;
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="font-num text-base font-bold tabular-nums">{value}</span>
      </div>
      <ProgressBar value={value} max={max} label={label} />
    </div>
  );
}
