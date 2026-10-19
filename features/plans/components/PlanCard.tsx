import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { EliteBadge, MostChosenBadge } from "@/components/shared/Badges";
import { formatINR } from "@/lib/utils/currency";

interface Props {
  name: string;
  price: number;
  tagline?: string;
  features: string[];
  mostChosen?: boolean;
  elite?: boolean;
  disabled?: boolean;
  ctaLabel?: string;
  onSelect?: () => void;
}

export function PlanCard({
  name,
  price,
  tagline,
  features,
  mostChosen,
  elite,
  disabled,
  ctaLabel = "Choose Plan",
  onSelect,
}: Props) {
  return (
    <Card
      variant="feature"
      className={cn(
        "flex h-full flex-col",
        mostChosen && "border-maroon-600 border-2",
        elite && "border-gold-500 border-2",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-display text-xl font-bold">{name}</h3>
        {mostChosen && <MostChosenBadge />}
        {elite && <EliteBadge />}
      </div>
      {tagline && <p className="text-navy-400 mt-1 text-sm">{tagline}</p>}
      <p className="font-display mt-4 text-4xl font-bold">{formatINR(price)}</p>
      <ul className="mt-4 flex-1 space-y-2 text-sm">
        {features.map((f) => (
          <li key={f} className="flex gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-green-600" aria-hidden />
            {f}
          </li>
        ))}
      </ul>
      <Button
        className="mt-6 w-full"
        variant={mostChosen ? "primary" : "secondary"}
        disabled={disabled}
        onClick={onSelect}
      >
        {ctaLabel}
      </Button>
    </Card>
  );
}
