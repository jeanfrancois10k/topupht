import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Label = forwardRef<HTMLLabelElement, ComponentPropsWithoutRef<"label">>(({ className, ...props }, ref) => {
  return <label ref={ref} className={cn("text-sm font-medium text-surface-200", className)} {...props} />;
});
Label.displayName = "Label";