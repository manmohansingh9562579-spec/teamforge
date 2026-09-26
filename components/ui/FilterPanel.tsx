"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "./Button";

export interface FilterDef {
  key: string;
  label: string;
  options: readonly string[];
}

export function FilterPanel({
  filters,
  values,
  onChange,
  onClear,
}: {
  filters: FilterDef[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onClear?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const activeCount = Object.values(values).filter(Boolean).length;

  return (
    <div>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="sm:hidden"
      >
        <SlidersHorizontal className="h-3.5 w-3.5" />
        Filters {activeCount > 0 && `(${activeCount})`}
      </Button>

      <div className={`${open ? "flex" : "hidden"} mt-3 flex-wrap gap-2 sm:mt-0 sm:flex`}>
        {filters.map((f) => (
          <select
            key={f.key}
            aria-label={`Filter by ${f.label.replace(/^Any /, "").toLowerCase()}`}
            value={values[f.key] ?? ""}
            onChange={(e) => onChange(f.key, e.target.value)}
            className="h-10 rounded-lg border border-border bg-surface px-3 text-[13px] text-text focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          >
            <option value="">{f.label}</option>
            {f.options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        ))}
        {activeCount > 0 && (
          <button
            onClick={() => onClear ? onClear() : filters.forEach((f) => onChange(f.key, ""))}
            className="flex min-h-10 items-center gap-1 rounded-lg px-2 text-[13px] text-muted hover:text-text"
          >
            <X className="h-3.5 w-3.5" /> Clear
          </button>
        )}
      </div>
    </div>
  );
}
