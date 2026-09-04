"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { type ComponentPropsWithoutRef } from "react";

interface NavLinkProps extends ComponentPropsWithoutRef<typeof Link> {
  icon?: React.ReactNode;
}

export function NavLink({ href, icon, className, children, ...props }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-surface-300 transition-colors hover:bg-surface-800 hover:text-surface-100",
        isActive && "bg-surface-700 text-surface-100",
        className
      )}
      {...props}
    >
      {icon && <span className="flex h-5 w-5 shrink-0 items-center justify-center">{icon}</span>}
      {children}
    </Link>
  );
}
NavLink.displayName = "NavLink";