"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-8 flex items-center justify-center gap-3">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-text disabled:opacity-40 hover:bg-surface-hover disabled:hover:bg-transparent"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="text-[13px] text-muted">
        Page {page} of {totalPages}
      </span>
      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
        className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-text disabled:opacity-40 hover:bg-surface-hover disabled:hover:bg-transparent"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
