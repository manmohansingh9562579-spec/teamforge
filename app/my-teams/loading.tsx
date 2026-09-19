import { Skeleton } from "@/components/ui/Skeleton";
import { TeamCardSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen">
      <div className="h-16 border-b border-border" />
      <div className="container-page max-w-[960px] py-10">
        <Skeleton className="h-7 w-40" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <TeamCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
