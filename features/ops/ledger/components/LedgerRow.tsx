import { cn } from "@/lib/utils/cn";
import { formatINR } from "@/lib/utils/currency";

interface Props {
  date: string;
  description: string;
  /** Positive = credit, negative = debit. */
  amount: number;
  balance?: number;
}

export function LedgerRow({ date, description, amount, balance }: Props) {
  return (
    <div className="border-line flex items-center justify-between gap-4 border-b py-3 last:border-0">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{description}</p>
        <p className="text-navy-400 text-xs">{date}</p>
      </div>
      <div className="text-right">
        <p
          className={cn(
            "text-sm font-semibold tabular-nums",
            amount >= 0 ? "text-green-600" : "text-maroon-600",
          )}
        >
          {amount >= 0 ? "+" : ""}
          {formatINR(amount)}
        </p>
        {balance !== undefined && (
          <p className="text-navy-400 text-xs tabular-nums">Balance {formatINR(balance)}</p>
        )}
      </div>
    </div>
  );
}
