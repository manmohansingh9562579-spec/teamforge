"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/Button";
import { FormError, Input, Label } from "@/components/ui/Input";
import { resetPasswordSchema } from "@/validations/auth";

export function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const parsed = resetPasswordSchema.safeParse({ token, password, confirmPassword });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Check your password and try again.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || "This reset link is invalid or expired. Request a new one.");
        return;
      }
      setIsComplete(true);
    } catch {
      setError("Password reset is unavailable right now. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout title={isComplete ? "Password updated" : "Choose a new password"} subtitle={
      isComplete ? "Your TeamForge password has been changed." : "Use at least 8 characters, including a lowercase letter, an uppercase letter, and a number."
    }>
      {isComplete ? (
        <div role="status" aria-live="polite">
          <p className="text-sm leading-6 text-muted">Other active sign-in sessions have been invalidated. Sign in again with your new password.</p>
          <Link href="/signin" className="mt-5 inline-flex text-sm font-medium text-accent hover:underline">
            Go to sign in
          </Link>
        </div>
      ) : !token ? (
        <div>
          <p role="alert" className="text-sm leading-6 text-danger">This reset link is invalid or expired. Request a new one.</p>
          <Link href="/forgot-password" className="mt-5 inline-flex text-sm font-medium text-accent hover:underline">
            Request another reset link
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="confirm-password">Confirm new password</Label>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </div>

          {error && <div role="alert"><FormError>{error}</FormError></div>}

          <Button type="submit" className="w-full" loading={isSubmitting}>
            Update password
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
