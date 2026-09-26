"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Search, Users, FolderKanban, Bell, Network } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/discover", label: "Discover", icon: Search },
  { href: "/teams", label: "Teams", icon: Users },
  { href: "/my-teams", label: "My teams", icon: FolderKanban },
  { href: "/connections", label: "Connect", icon: Network },
  { href: "/notifications", label: "Alerts", icon: Bell },
];

export function MobileNavigation({ unreadCount = 0 }: { unreadCount?: number }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary navigation" className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg/95 backdrop-blur-md md:hidden">
      <div className="flex h-16 items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {links.map((l) => {
          const active = pathname === l.href || pathname?.startsWith(l.href + "/");
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-1 py-1.5 text-[10px] font-medium",
                active ? "text-accent" : "text-muted"
              )}
            >
              <l.icon className="h-5 w-5" strokeWidth={active ? 2.25 : 1.75} />
              {l.label}
              {l.href === "/notifications" && unreadCount > 0 && (
                <span className="absolute right-[calc(50%-14px)] top-0.5 h-2 w-2 rounded-full bg-accent" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
