import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface AvatarProps extends ComponentPropsWithoutRef<"div"> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg";
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(({ src, alt = "", fallback, size = "md", className, ...props }, ref) => {
  const sizeClasses = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-14 w-14 text-lg" };
  const initials = fallback ?? alt.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  const colors = ["bg-brand-600", "bg-htg-600", "bg-indigo-600", "bg-purple-600", "bg-pink-600", "bg-amber-600"];
  const colorIndex = alt.charCodeAt(0) % colors.length;

  return (
    <div ref={ref} className={cn("relative flex shrink-0 overflow-hidden rounded-full", sizeClasses[size], className)} {...props}>
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <div className={cn("flex h-full w-full items-center justify-center rounded-full text-white font-semibold", colors[colorIndex])}>
          {initials}
        </div>
      )}
    </div>
  );
});
Avatar.displayName = "Avatar";