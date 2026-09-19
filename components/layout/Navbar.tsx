"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/Button";

const links = [
  { href: "/discover", label: "Discover" },
  { href: "/teams", label: "Teams" },
  { href: "/about", label: "How it works" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-6 md:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm text-muted transition-colors hover:text-text"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <Link href="/signin" className="text-sm text-muted hover:text-text">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-9 items-center justify-center rounded-md bg-accent px-4 text-sm font-medium text-on-accent transition-colors hover:bg-accent-hover"
          >
            Get started
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-text"
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
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-b border-border bg-bg md:hidden"
          >
            <div className="container-page flex flex-col gap-1 py-3">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-2 py-2.5 text-sm text-text hover:bg-surface-hover"
                >
                  {l.label}
                </Link>
              ))}
              <div className="my-2 h-px bg-border" />
              <Link
                href="/signin"
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2.5 text-sm text-text hover:bg-surface-hover"
              >
                Sign in
              </Link>
              <Link href="/signup" onClick={() => setOpen(false)} className="mt-1">
                <Button className="w-full">Get started</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
