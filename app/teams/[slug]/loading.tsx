import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen">
      <div className="h-16 border-b border-border" />
      <div className="container-page max-w-[820px] py-10">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="mt-3 h-8 w-2/3" />
        <Skeleton className="mt-2 h-4 w-1/3" />
        <Skeleton className="mt-8 h-24 w-full" />
      </div>
    </div>
  );
}
