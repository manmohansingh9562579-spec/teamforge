import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DiscoverPageClient } from "@/components/developers/DiscoverPageClient";
import { DeveloperCardSkeleton } from "@/components/ui/Skeleton";

export default function DiscoverPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container-page py-8 sm:py-12">
          <div className="max-w-[680px]">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">People, skills, ideas</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
              Discover developers
            </h1>
            <p className="mt-3 text-base leading-relaxed text-muted">
              Find people for your next build by skills, roles, experience and interests.
          </p>
          </div>
          <div className="mt-6">
            <Suspense
              fallback={
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => <DeveloperCardSkeleton key={index} />)}
                </div>
              }
            >
              <DiscoverPageClient />
            </Suspense>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
