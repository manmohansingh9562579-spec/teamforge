import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TeamsPageClient } from "@/components/teams/TeamsPageClient";

export default function TeamsDiscoveryPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container-page py-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-text">
                Discover teams
              </h1>
              <p className="mt-1 text-sm text-muted">
                Find an open team that needs your skills.
              </p>
            </div>
            <Link
              href="/teams/create"
              className="hidden h-9 items-center gap-1.5 rounded-md bg-accent px-3 text-[13px] font-medium text-on-accent hover:bg-accent-hover sm:inline-flex"
            >
              <Plus className="h-3.5 w-3.5" /> Create team
            </Link>
          </div>
          <div className="mt-6">
            <Suspense fallback={null}>
              <TeamsPageClient />
            </Suspense>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
