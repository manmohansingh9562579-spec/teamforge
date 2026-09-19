"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, LogOut, User } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";

export function UserMenu({ name, image }: { name: string; image?: string | null }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((v) => !v)} aria-label="Account menu">
        <Avatar name={name} src={image} size="sm" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-md border border-border bg-surface shadow-raised"
          >
            <div className="border-b border-border px-3 py-2.5">
              <p className="truncate text-[13px] font-medium text-text">{name}</p>
            </div>
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-[13px] text-text hover:bg-surface-hover"
            >
              <User className="h-4 w-4" /> Profile
            </Link>
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-[13px] text-text hover:bg-surface-hover"
            >
              <Settings className="h-4 w-4" /> Settings
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-danger hover:bg-surface-hover"
            >
              <LogOut className="h-4 w-4" /> Log out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
