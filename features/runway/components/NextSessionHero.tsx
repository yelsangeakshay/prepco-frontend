import { CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Props {
  eyebrow?: string;
  title: string;
  when: string;
  detail?: string;
  ctaLabel: string;
  onCta?: () => void;
}

export function NextSessionHero({
  eyebrow = "Next session",
  title,
  when,
  detail,
  ctaLabel,
  onCta,
}: Props) {
  return (
    <Card
      variant="navy"
      className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
    >
      <div>
        <p className="text-gold-300 text-xs font-semibold tracking-widest uppercase">{eyebrow}</p>
        <h2 className="font-display mt-1 text-2xl font-bold md:text-3xl">{title}</h2>
        <p className="mt-2 flex items-center gap-2 text-sm text-white/85">
          <CalendarClock className="size-4" aria-hidden /> {when}
        </p>
        {detail && <p className="mt-1 text-sm text-white/65">{detail}</p>}
      </div>
      <Button variant="onNavy" onClick={onCta} className="w-full md:w-auto">
        {ctaLabel}
      </Button>
    </Card>
  );
}
