"use client";

import { useState, useRef, useEffect } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "./ThemeProvider";
import { cn } from "@/lib/utils";

const options = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const Active = options.find((o) => o.value === theme)?.icon ?? Monitor;

  return (
    <div className="relative" ref={ref}>
      <button
        aria-label="Change theme"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted transition-colors hover:bg-surface-hover hover:text-text"
      >
        <Active className="h-4 w-4" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-50 mt-2 w-36 overflow-hidden rounded-md border border-border bg-surface shadow-raised"
          >
            {options.map((o) => (
              <button
                key={o.value}
                onClick={() => {
                  setTheme(o.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-text transition-colors hover:bg-surface-hover",
                  theme === o.value && "text-accent"
                )}
              >
                <o.icon className="h-4 w-4" />
                {o.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
