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
}: {
  filters: FilterDef[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const activeCount = Object.values(values).filter(Boolean).length;

  return (
    <div>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setOpen((v) => !v)}
        className="sm:hidden"
      >
        <SlidersHorizontal className="h-3.5 w-3.5" />
        Filters {activeCount > 0 && `(${activeCount})`}
      </Button>

      <div className={`${open ? "flex" : "hidden"} mt-3 flex-wrap gap-2 sm:mt-0 sm:flex`}>
        {filters.map((f) => (
          <select
            key={f.key}
            value={values[f.key] ?? ""}
            onChange={(e) => onChange(f.key, e.target.value)}
            className="h-9 rounded-md border border-border bg-surface px-2.5 text-[13px] text-text focus:border-accent focus:outline-none"
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
            onClick={() => filters.forEach((f) => onChange(f.key, ""))}
            className="flex items-center gap-1 rounded-md px-2 text-[13px] text-muted hover:text-text"
          >
            <X className="h-3.5 w-3.5" /> Clear
          </button>
        )}
      </div>
    </div>
  );
}
