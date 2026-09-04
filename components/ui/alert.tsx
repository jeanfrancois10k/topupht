import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface AlertProps extends ComponentPropsWithoutRef<"div"> {
  variant?: "default" | "destructive" | "success" | "warning" | "info";
}

const alertVariants = {
  default: "bg-surface-800 border-surface-700 text-surface-200",
  destructive: "bg-red-950/30 border-red-800/50 text-red-400",
  success: "bg-green-950/30 border-green-800/50 text-green-400",
  warning: "bg-yellow-950/30 border-yellow-800/50 text-yellow-400",
  info: "bg-blue-950/30 border-blue-800/50 text-blue-400",
};

export const Alert = forwardRef<HTMLDivElement, AlertProps>(({ className, variant = "default", children, ...props }, ref) => {
  return (
    <div ref={ref} role="alert" className={cn("relative w-full rounded-lg border p-4 leading-none [&>strong]:font-semibold", alertVariants[variant], className)} {...props}>
      {children}
    </div>
  );
});
Alert.displayName = "Alert";

interface AlertTitleProps extends ComponentPropsWithoutRef<"p"> {
  children: React.ReactNode;
}

export const AlertTitle = forwardRef<HTMLParagraphElement, AlertTitleProps>(({ className, children, ...props }, ref) => {
  return <p ref={ref} className={cn("mb-1 text-sm font-semibold", className)} {...props}>{children}</p>;
});
AlertTitle.displayName = "AlertTitle";

interface AlertDescriptionProps extends ComponentPropsWithoutRef<"div"> {
  children: React.ReactNode;
}

export const AlertDescription = forwardRef<HTMLDivElement, AlertDescriptionProps>(({ className, children, ...props }, ref) => {
  return <div ref={ref} className={cn("text-sm [&>p]:text-xs", className)} {...props}>{children}</div>;
});
AlertDescription.displayName = "AlertDescription";