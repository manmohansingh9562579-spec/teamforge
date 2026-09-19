import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen">
      <div className="h-16 border-b border-border" />
      <div className="container-page max-w-[720px] py-10">
        <Skeleton className="h-7 w-32" />
        <div className="mt-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
