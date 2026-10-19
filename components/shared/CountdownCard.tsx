import { Card } from "@/components/ui/card";
import { Day0Badge } from "./Badges";

interface Props {
  days: number;
  dateLabel: string;
}

export function CountdownCard({ days, dateLabel }: Props) {
  return (
    <Card variant="navy">
      <Day0Badge />
      <p className="font-display text-gold-300 mt-3 text-5xl font-bold">{days}</p>
      <p className="text-sm text-white/80">days to Day 0</p>
      <p className="mt-2 text-sm font-medium">{dateLabel}</p>
    </Card>
  );
}
