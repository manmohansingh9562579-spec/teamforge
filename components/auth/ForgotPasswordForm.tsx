"use client";

import Link from "next/link";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { FormError, Input, Label } from "@/components/ui/Input";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/validations/auth";

export function ForgotPasswordForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (values: ForgotPasswordInput) => {
    setMessage(null);
    setServerError(null);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = await response.json();
      if (!response.ok) {
        setServerError(result.error ?? "Could not send reset instructions. Try again later.");
        return;
      }
      setMessage(result.data?.message ?? "If an account exists for that email, reset instructions will arrive shortly.");
    } catch {
      setServerError("Could not send reset instructions. Check your connection and try again.");
    }
  };

  return (
    <>
      {message ? (
        <div role="status" className="rounded-lg border border-success/20 bg-success/10 p-4 text-sm leading-6 text-text">
          <p className="font-medium">Check your inbox</p>
          <p className="mt-1 text-muted">{message} Check your spam folder too. The link expires in 30 minutes.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" autoFocus {...register("email")} />
            <FormError>{errors.email?.message}</FormError>
          </div>

          {serverError && (
            <div role="alert" className="rounded-md bg-danger/10 px-3 py-2 text-[13px] text-danger">
              {serverError}
            </div>
          )}

          <Button type="submit" className="w-full" loading={isSubmitting}>
            Send reset link
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-[13px] text-muted">
        Remembered it?{" "}
        <Link href="/signin" className="font-medium text-accent hover:underline">Back to sign in</Link>
      </p>
    </>
  );
}
