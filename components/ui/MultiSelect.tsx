"use client";

import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function MultiSelect({
  value,
  onChange,
  suggestions = [],
  placeholder = "Type and press Enter",
  max,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  suggestions?: readonly string[];
  placeholder?: string;
  max?: number;
}) {
  const [input, setInput] = useState("");

  const add = (raw: string) => {
    const v = raw.trim();
    if (!v) return;
    if (value.some((existing) => existing.toLowerCase() === v.toLowerCase())) return;
    if (max && value.length >= max) return;
    onChange([...value, v]);
    setInput("");
  };

  const remove = (v: string) => onChange(value.filter((x) => x !== v));

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add(input);
    } else if (e.key === "Backspace" && !input && value.length > 0) {
      remove(value[value.length - 1]);
    }
  };

  const available = suggestions.filter(
    (s) => !value.some((v) => v.toLowerCase() === s.toLowerCase())
  );

  return (
    <div>
      <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-md border border-border bg-surface px-2 py-1.5 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20">
        {value.map((v) => (
          <span
            key={v}
            className="inline-flex items-center gap-1 rounded-sm bg-accent-soft px-2 py-0.5 font-mono text-[11px] text-accent"
          >
            {v}
            <button
              type="button"
              aria-label={`Remove ${v}`}
              onClick={() => remove(v)}
              className="rounded-sm hover:opacity-70"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={value.length === 0 ? placeholder : ""}
          className="min-w-[100px] flex-1 bg-transparent text-[14px] text-text placeholder:text-muted focus:outline-none"
        />
      </div>

      {available.length > 0 && (!max || value.length < max) && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {available.slice(0, 12).map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => add(s)}
              className={cn(
                "rounded-sm border border-border px-2 py-0.5 font-mono text-[11px] text-muted",
                "transition-colors hover:border-accent hover:text-accent"
              )}
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
