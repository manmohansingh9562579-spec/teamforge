"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Label, Input, FormError } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { signUpSchema, type SignUpInput } from "@/validations/auth";

export default function SignUpPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({ resolver: zodResolver(signUpSchema) });

  const onSubmit = async (values: SignUpInput) => {
    setServerError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();

      if (!res.ok) {
        setServerError(json.error ?? "Could not create your account");
        return;
      }

      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        toast.success("Account created — sign in to continue");
        router.push("/signin");
        return;
      }

      toast.success("Welcome to TeamForge");
      router.push("/onboarding");
      router.refresh();
    } catch {
      setServerError("Something went wrong. Please try again.");
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Start finding teammates in minutes.">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input id="name" autoComplete="name" {...register("name")} />
          <FormError>{errors.name?.message}</FormError>
        </div>

        <div>
          <Label htmlFor="username">Username</Label>
          <Input id="username" autoComplete="username" {...register("username")} />
          <FormError>{errors.username?.message}</FormError>
        </div>

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
            autoComplete="new-password"
            {...register("password")}
          />
          <FormError>{errors.password?.message}</FormError>
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            {...register("confirmPassword")}
          />
          <FormError>{errors.confirmPassword?.message}</FormError>
        </div>

        {serverError && (
          <div role="alert" className="rounded-md bg-danger/10 px-3 py-2 text-[13px] text-danger">
            {serverError}
          </div>
        )}

        <Button type="submit" className="w-full" loading={isSubmitting}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-[13px] text-muted">
        Already have an account?{" "}
        <Link href="/signin" className="font-medium text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
