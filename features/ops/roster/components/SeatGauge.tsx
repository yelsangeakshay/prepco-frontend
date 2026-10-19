import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/shared/ProgressBar";

interface Props {
  label: string;
  taken: number;
  total: number;
}

export function SeatGauge({ label, taken, total }: Props) {
  const left = Math.max(0, total - taken);
  return (
    <Card>
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-navy-400 text-xs">{left === 0 ? "Full" : `${left} seats left`}</p>
      </div>
      <p className="font-display mt-1 text-2xl font-bold tabular-nums">
        {taken}
        <span className="text-navy-400 text-base font-normal"> / {total}</span>
      </p>
      <ProgressBar className="mt-2" value={taken} max={total} label={`${label} seats taken`} />
    </Card>
  );
}
