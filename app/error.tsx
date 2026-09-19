"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/ErrorState";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-page py-20">
      <ErrorState
        title="Something went wrong"
        description="An unexpected error occurred while loading this page."
        onRetry={reset}
      />
    </div>
  );
}
