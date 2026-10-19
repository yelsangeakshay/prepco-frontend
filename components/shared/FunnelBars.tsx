import { ProgressBar } from "./ProgressBar";

export interface FunnelStage {
  label: string;
  value: number;
}

/** Horizontal funnel, each stage scaled against the first. */
export function FunnelBars({ stages }: { stages: FunnelStage[] }) {
  const top = stages[0]?.value || 1;
  return (
    <ul className="space-y-3">
      {stages.map((s, i) => {
        const prev = stages[i - 1]?.value;
        return (
          <li key={s.label}>
            <div className="mb-1 flex items-baseline justify-between text-sm">
              <span className="font-medium">{s.label}</span>
              <span className="tabular-nums">
                <strong className="font-display text-base">
                  {s.value.toLocaleString("en-IN")}
                </strong>
                {prev ? (
                  <span className="text-navy-400 ml-2 text-xs">
                    {Math.round((s.value / prev) * 100)}%
                  </span>
                ) : null}
              </span>
            </div>
            <ProgressBar value={s.value} max={top} label={s.label} />
          </li>
        );
      })}
    </ul>
  );
}
