import * as React from "react";
import { cn } from "@/lib/utils/cn";

interface Props extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
  /** Label for the empty option, e.g. "All plans". */
  placeholder?: string;
}

/** Labelled native select for filters. */
export function Select({ label, options, placeholder, className, id, ...rest }: Props) {
  const autoId = React.useId();
  const sid = id ?? autoId;
  return (
    <div className="flex flex-col">
      <label htmlFor={sid} className="text-navy-400 mb-1 text-xs font-semibold">
        {label}
      </label>
      <select
        id={sid}
        className={cn(
          "rounded-control border-line min-h-11 border bg-white px-3 text-sm md:min-h-10",
          className,
        )}
        {...rest}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
