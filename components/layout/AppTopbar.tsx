"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";

export function AppTopbar({
  name,
  image,
  unreadCount = 0,
}: {
  name: string;
  image?: string | null;
  unreadCount?: number;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <Logo />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/notifications"
            className="relative hidden h-9 w-9 items-center justify-center rounded-md border border-border text-muted transition-colors hover:bg-surface-hover hover:text-text md:flex"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent" />
            )}
          </Link>
          <UserMenu name={name} image={image} />
        </div>
      </div>
    </header>
  );
}
