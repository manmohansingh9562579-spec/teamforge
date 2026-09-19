"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function ErrorState({
  title = "Something went wrong",
  description = "Please try again in a moment.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-border py-16 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-danger/10">
        <AlertTriangle className="h-5 w-5 text-danger" strokeWidth={1.75} />
      </div>
      <h3 className="mt-4 text-[15px] font-medium text-text">{title}</h3>
      <p className="mt-1.5 max-w-[36ch] text-sm text-muted">{description}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-5" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
