"use client";

import Link from "next/link";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { FormError, Input, Label } from "@/components/ui/Input";
import {
  resetPasswordFormSchema,
  type ResetPasswordFormInput,
} from "@/validations/auth";

export function ResetPasswordForm({ token }: { token: string }) {
  const [complete, setComplete] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormInput>({ resolver: zodResolver(resetPasswordFormSchema) });

  const onSubmit = async (values: ResetPasswordFormInput) => {
    setServerError(null);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: values.password }),
      });
      const result = await response.json();
      if (!response.ok) {
        setServerError(result.error ?? "This reset link is invalid or has expired.");
        return;
      }
      setComplete(true);
    } catch {
      setServerError("Could not update your password. Please try again.");
    }
  };

  if (!token) {
    return (
      <div>
        <p role="alert" className="rounded-md bg-danger/10 px-3 py-2 text-[13px] text-danger">
          This reset link is missing or invalid. Request a new one to continue.
        </p>
        <Link href="/forgot-password" className="mt-4 block text-center text-[13px] font-medium text-accent hover:underline">
          Request a new reset link
        </Link>
      </div>
    );
  }

  if (complete) {
    return (
      <div role="status" className="rounded-lg border border-success/20 bg-success/10 p-4 text-sm leading-6 text-text">
        <p className="font-medium">Password updated</p>
        <p className="mt-1 text-muted">Your new password is ready. Sign in to continue.</p>
        <Link href="/signin" className="mt-4 inline-flex font-medium text-accent hover:underline">Go to sign in</Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div>
        <Label htmlFor="password">New password</Label>
        <Input id="password" type="password" autoComplete="new-password" autoFocus {...register("password")} />
        <FormError>{errors.password?.message}</FormError>
      </div>
      <div>
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <Input id="confirmPassword" type="password" autoComplete="new-password" {...register("confirmPassword")} />
        <FormError>{errors.confirmPassword?.message}</FormError>
      </div>

      {serverError && (
        <div role="alert" className="rounded-md bg-danger/10 px-3 py-2 text-[13px] text-danger">
          {serverError}
        </div>
      )}

      <Button type="submit" className="w-full" loading={isSubmitting}>
        Update password
      </Button>
    </form>
  );
}
