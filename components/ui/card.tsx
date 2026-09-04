import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Card = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<"div">>(({ className, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("rounded-xl border border-surface-700 bg-surface-800 p-5 shadow-lg card-hover", className)} {...props} />
  );
});
Card.displayName = "Card";

export const CardHeader = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<"div">>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("flex flex-col space-y-1.5 p-0", className)} {...props} />;
});
CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef<HTMLParagraphElement, ComponentPropsWithoutRef<"p">>(({ className, ...props }, ref) => {
  return <p ref={ref} className={cn("text-lg font-semibold text-surface-100", className)} {...props} />;
});
CardTitle.displayName = "CardTitle";

export const CardDescription = forwardRef<HTMLParagraphElement, ComponentPropsWithoutRef<"p">>(({ className, ...props }, ref) => {
  return <p ref={ref} className={cn("text-sm text-surface-300", className)} {...props} />;
});
CardDescription.displayName = "CardDescription";

export const CardContent = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<"div">>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("p-0 pt-4", className)} {...props} />;
});
CardContent.displayName = "CardContent";

export const CardFooter = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<"div">>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("flex items-center p-0 pt-4", className)} {...props} />;
});
CardFooter.displayName = "CardFooter";