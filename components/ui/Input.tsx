import { forwardRef, type InputHTMLAttributes, type LabelHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Label = ({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={cn("mb-1.5 block text-[13px] font-medium text-text", className)} {...props} />
);

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-md border border-border bg-surface px-3 text-[14px] text-text placeholder:text-muted",
        "transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-md border border-border bg-surface px-3 py-2 text-[14px] text-text placeholder:text-muted",
        "transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export function FormError({ children }: { children?: string }) {
  if (!children) return null;
  return <p className="mt-1.5 text-[13px] text-danger">{children}</p>;
}
