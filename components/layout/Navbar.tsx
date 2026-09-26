"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Bell, Menu, Network, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";
import { cn } from "@/lib/utils";

const links = [
  { href: "/discover", label: "Discover" },
  { href: "/teams", label: "Teams" },
  { href: "/about", label: "How it works" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const authenticated = status === "authenticated";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Logo />
          <nav aria-label="Main navigation" className="hidden items-center gap-1 md:flex">
            {links.map((link) => {
              const active = pathname === link.href || pathname?.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active ? "bg-accent-soft text-accent" : "text-muted hover:bg-surface-hover hover:text-text"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          {authenticated ? (
            <>
              <Link
                href="/connections"
                aria-label="Connections"
                className="flex h-10 w-10 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-hover hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
              >
                <Network className="h-4 w-4" />
              </Link>
              <Link
                href="/notifications"
                aria-label="Notifications"
                className="flex h-10 w-10 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-hover hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
              >
                <Bell className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex h-10 items-center justify-center rounded-lg bg-accent px-4 text-sm font-medium text-on-accent transition-colors hover:bg-accent-hover"
              >
                Dashboard
              </Link>
              <UserMenu name={session.user?.name ?? "Account"} image={session.user?.image} />
            </>
          ) : (
            <>
              <Link href="/signin" className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-text">
                Sign in
              </Link>
              <Link
                href="/signup"
                className="inline-flex h-10 items-center justify-center rounded-lg bg-accent px-4 text-sm font-medium text-on-accent transition-colors hover:bg-accent-hover"
              >
                Get started
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-text transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden border-t border-border bg-bg md:hidden"
          >
            <nav aria-label="Mobile navigation" className="container-page flex flex-col gap-1 py-3">
              {links.map((link) => {
                const active = pathname === link.href || pathname?.startsWith(`${link.href}/`);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "min-h-11 rounded-lg px-3 py-3 text-sm font-medium transition-colors",
                      active ? "bg-accent-soft text-accent" : "text-text hover:bg-surface-hover"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="my-2 h-px bg-border" />
              {authenticated ? (
                <>
                  <Link href="/dashboard" onClick={() => setOpen(false)} className="min-h-11 rounded-lg px-3 py-3 text-sm font-medium text-text hover:bg-surface-hover">Dashboard</Link>
                  <Link href="/connections" onClick={() => setOpen(false)} className="min-h-11 rounded-lg px-3 py-3 text-sm font-medium text-text hover:bg-surface-hover">Connections</Link>
                  <Link href="/notifications" onClick={() => setOpen(false)} className="min-h-11 rounded-lg px-3 py-3 text-sm font-medium text-text hover:bg-surface-hover">Notifications</Link>
                  <Link href="/profile" onClick={() => setOpen(false)} className="min-h-11 rounded-lg px-3 py-3 text-sm font-medium text-text hover:bg-surface-hover">Your profile</Link>
                </>
              ) : (
                <>
                  <Link href="/signin" onClick={() => setOpen(false)} className="min-h-11 rounded-lg px-3 py-3 text-sm font-medium text-text hover:bg-surface-hover">Sign in</Link>
                  <Link
                    href="/signup"
                    onClick={() => setOpen(false)}
                    className="mt-1 inline-flex h-11 w-full items-center justify-center rounded-lg bg-accent px-4 text-sm font-medium text-on-accent transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2"
                  >
                    Get started
                  </Link>
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
