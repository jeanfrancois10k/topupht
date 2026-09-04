import { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return <div className={cn("rounded-lg bg-surface-700 animate-pulse", className)} {...props} />;
}

export function TextSkeleton({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return <Skeleton className="h-4 w-full" {...props} />;
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-surface-700 bg-surface-800 p-5 space-y-4">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

export function GridSkeleton({ cols = 3 }: { cols?: number }) {
  return (
    <div className={`grid gap-4 ${cols === 2 ? "md:grid-cols-2" : cols === 3 ? "md:grid-cols-3" : "md:grid-cols-4"}`}>
      {Array.from({ length: cols * 2 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}