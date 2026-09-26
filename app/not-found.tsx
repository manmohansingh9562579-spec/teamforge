import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        <p className="font-mono text-sm text-accent">404</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-text">
          Page not found
        </h1>
        <p className="mt-2 max-w-[40ch] text-sm text-muted">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex h-10 items-center rounded-md bg-accent px-5 text-[14px] font-medium text-on-accent hover:bg-accent-hover"
        >
          Back to home
        </Link>
      </main>
      <Footer />
    </div>
  );
}
