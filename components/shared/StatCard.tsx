import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

interface Props {
  label: string;
  value: string | number;
  hint?: string;
  /** maroon = needs action, green = done. */
  tone?: "default" | "maroon" | "green";
}

export function StatCard({ label, value, hint, tone = "default" }: Props) {
  return (
    <Card>
      <p className="text-navy-400 text-xs font-semibold tracking-wider uppercase">{label}</p>
      <p
        className={cn(
          "font-num mt-1 text-3xl font-bold",
          tone === "maroon" && "text-maroon-600",
          tone === "green" && "text-green-600",
        )}
      >
        {value}
      </p>
      {hint && <p className="text-navy-400 mt-1 text-sm">{hint}</p>}
    </Card>
  );
}
