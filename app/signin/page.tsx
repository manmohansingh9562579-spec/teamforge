"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Label, Input, FormError } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { signInSchema, type SignInInput } from "@/validations/auth";

export default function SignInPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInInput>({ resolver: zodResolver(signInSchema) });

  const onSubmit = async (values: SignInInput) => {
    setServerError(null);
    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    if (result?.error) {
      setServerError("Incorrect email or password");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your TeamForge account.">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" {...register("email")} />
          <FormError>{errors.email?.message}</FormError>
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register("password")}
          />
          <FormError>{errors.password?.message}</FormError>
        </div>

        {serverError && (
          <div role="alert" className="rounded-md bg-danger/10 px-3 py-2 text-[13px] text-danger">
            {serverError}
          </div>
        )}

        <Button type="submit" className="w-full" loading={isSubmitting}>
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-[13px] text-muted">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-medium text-accent hover:underline">
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
}
