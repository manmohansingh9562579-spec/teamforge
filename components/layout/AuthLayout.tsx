import type { ReactNode } from "react";
import { Logo } from "@/components/layout/Logo";

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface/40 px-4 py-12">
      <div className="w-full max-w-[400px]">
        <div className="mb-8 flex justify-center">
          <Logo size={32} />
        </div>
        <div className="rounded-xl border border-border bg-surface p-7 shadow-raised sm:p-8">
          <h1 className="text-xl font-semibold tracking-tight text-text">{title}</h1>
          <p className="mt-1.5 text-sm text-muted">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
