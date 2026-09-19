"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  className,
  debounceMs = 350,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
}) {
  const [local, setLocal] = useState(value);

  useEffect(() => setLocal(value), [value]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (local !== value) onChange(local);
    }, debounceMs);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local]);

  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <input
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-[14px] text-text placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
      />
    </div>
  );
}
