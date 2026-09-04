import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className, type = "text", ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-lg border border-surface-600 bg-surface-800 px-3 py-2 text-sm text-surface-100 placeholder-surface-400 transition-colors file:border-0 file:bg-surface-700 file:text-sm file:text-surface-200 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, InputHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[100px] w-full rounded-lg border border-surface-600 bg-surface-800 px-3 py-2 text-sm text-surface-100 placeholder-surface-400 transition-colors file:border-0 file:bg-surface-700 file:text-sm file:text-surface-200 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export const Select = forwardRef<HTMLSelectElement, InputHTMLAttributes<HTMLSelectElement>>(({ className, ...props }, ref) => {
  return (
    <select
      className={cn(
        "flex h-10 w-full rounded-lg border border-surface-600 bg-surface-800 px-3 py-2 text-sm text-surface-100 transition-colors focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Select.displayName = "Select";