import { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export function Separator({ className, ...props }: ComponentPropsWithoutRef<"hr">) {
  return <hr className={cn("border-surface-700", className)} {...props} />;
}