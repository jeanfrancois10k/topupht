import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends ComponentPropsWithoutRef<"span"> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "purple" | "outline";
}

const badgeVariants = {
  default: "bg-surface-700 text-surface-200",
  success: "bg-green-500/15 text-green-400 border border-green-500/20",
  warning: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20",
  danger: "bg-red-500/15 text-red-400 border border-red-500/20",
  info: "bg-blue-500/15 text-blue-400 border border-blue-500/20",
  purple: "bg-purple-500/15 text-purple-400 border border-purple-500/20",
  outline: "border border-surface-500 text-surface-300",
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(({ className, variant = "default", ...props }, ref) => {
  return <span ref={ref} className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", badgeVariants[variant], className)} {...props} />;
});
Badge.displayName = "Badge";