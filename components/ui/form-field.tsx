"use client";

import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Label } from "./label";

interface FormFieldProps extends ComponentPropsWithoutRef<"div"> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function FormField({ label, error, helperText, className, children, ...props }: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)} {...props}>
      {label && <Label>{label}</Label>}
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
      {helperText && !error && <p className="text-xs text-surface-400">{helperText}</p>}
    </div>
  );
}