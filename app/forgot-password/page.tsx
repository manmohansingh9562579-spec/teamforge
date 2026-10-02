"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/Button";
import { FormError, Input, Label } from "@/components/ui/Input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || "Password reset is unavailable right now. Please try again later.");
        return;
      }
      setMessage(result.data?.message || "If an account matches that email, we'll send a reset link.");
    } catch {
      setError("Password reset is unavailable right now. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Forgot your password?" subtitle="We'll email you a secure link to choose a new one.">
      {message ? (
        <div role="status" aria-live="polite">
          <p className="rounded-lg border border-border bg-surface-hover px-4 py-3 text-sm leading-6 text-text">
            {message} Check your inbox and spam folder. The link expires in 60 minutes.
          </p>
          <Link href="/signin" className="mt-5 inline-flex text-sm font-medium text-accent hover:underline">
            Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          {error && <div role="alert"><FormError>{error}</FormError></div>}

          <Button type="submit" className="w-full" loading={isSubmitting}>
            Send reset link
          </Button>
          <p className="text-center text-[13px] text-muted">
            Remembered it? <Link href="/signin" className="font-medium text-accent hover:underline">Sign in</Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}
