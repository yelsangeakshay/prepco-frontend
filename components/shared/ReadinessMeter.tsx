interface Props {
  value: number;
  size?: number;
  label?: string;
}

/** Ring meter with a big Playfair number. */
export function ReadinessMeter({ value, size = 120, label = "Readiness" }: Props) {
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <defs>
          <linearGradient id="readiness-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#7C1F34" />
            <stop offset="100%" stopColor="#C0993D" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#EFE9DC"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#readiness-grad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct / 100)}
        />
      </svg>
      <div className="absolute text-center">
        <p className="font-num text-3xl leading-none font-bold">{pct}%</p>
        <p className="text-navy-400 mt-1 text-xs">{label}</p>
      </div>
    </div>
  );
}
