import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-surface-hover", className)}
      aria-hidden="true"
    />
  );
}

export function DeveloperCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <div className="flex items-center gap-3">
        <Skeleton className="h-11 w-11 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="mt-4 flex gap-1.5">
        <Skeleton className="h-5 w-14" />
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-12" />
      </div>
    </div>
  );
}

export function TeamCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <Skeleton className="h-3.5 w-1/2" />
      <Skeleton className="mt-2 h-3 w-3/4" />
      <div className="mt-4 flex gap-1.5">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-14" />
      </div>
      <Skeleton className="mt-4 h-3 w-1/3" />
    </div>
  );
}
