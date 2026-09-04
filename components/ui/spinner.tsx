import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface SpinnerProps extends ComponentPropsWithoutRef<"div"> {
  size?: "sm" | "md" | "lg";
}

export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(({ className, size = "md", ...props }, ref) => {
  const sizeClasses = { sm: "h-4 w-4", md: "h-8 w-8", lg: "h-12 w-12" };
  return (
    <div ref={ref} className={cn("animate-spin text-surface-400", sizeClasses[size], className)} {...props}>
      <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  );
});
Spinner.displayName = "Spinner";