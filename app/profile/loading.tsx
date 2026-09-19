import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen">
      <div className="h-16 border-b border-border" />
      <div className="container-page max-w-[720px] py-12">
        <div className="flex items-center gap-5">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="mt-8 h-20 w-full" />
      </div>
    </div>
  );
}
