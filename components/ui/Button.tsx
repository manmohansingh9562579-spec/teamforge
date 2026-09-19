"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary: "bg-accent text-on-accent hover:bg-accent-hover",
  secondary: "bg-surface text-text border border-border hover:bg-surface-hover",
  ghost: "text-text hover:bg-surface-hover",
  outline: "bg-transparent text-text border border-border-strong hover:bg-surface-hover",
  danger: "bg-danger text-white hover:opacity-90",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px] gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-[15px] gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.15 }}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors duration-200",
          "disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className
        )}
        {...(props as any)}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </motion.button>
    );
  }
);
Button.displayName = "Button";
