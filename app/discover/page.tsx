import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DiscoverPageClient } from "@/components/developers/DiscoverPageClient";

export default function DiscoverPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container-page py-10">
          <h1 className="text-xl font-semibold tracking-tight text-text">
            Discover developers
          </h1>
          <p className="mt-1 text-sm text-muted">
            Find teammates by skill, role, experience and interest.
          </p>
          <div className="mt-6">
            <Suspense fallback={null}>
              <DiscoverPageClient />
            </Suspense>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
