"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log client-side for observability without exposing details to the user.
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-bg px-4 text-center font-sans">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-danger/10">
          <AlertTriangle className="h-5 w-5 text-danger" strokeWidth={1.75} />
        </div>
        <h1 className="mt-4 text-xl font-semibold tracking-tight text-text">
          Something went wrong
        </h1>
        <p className="mt-2 max-w-[40ch] text-sm text-muted">
          An unexpected error occurred. You can try again, or head back to the homepage.
        </p>
        <div className="mt-6 flex gap-3">
          <Button variant="secondary" onClick={() => reset()}>
            Try again
          </Button>
          <a
            href="/"
            className="inline-flex h-10 items-center rounded-md bg-accent px-5 text-[14px] font-medium text-on-accent hover:bg-accent-hover"
          >
            Back to home
          </a>
        </div>
      </body>
    </html>
  );
}
