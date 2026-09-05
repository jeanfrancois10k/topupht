"use client";

import { type ComponentPropsWithoutRef, useEffect, useCallback, createContext, useContext, ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { X } from "lucide-react";

interface ModalContextValue {
  close: () => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) throw new Error("useModal must be used within Modal");
  return context;
}

interface ModalProps extends ComponentPropsWithoutRef<"div"> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Modal({ open, onOpenChange, children, size = "md", className, ...props }: ModalProps) {
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onOpenChange(false);
  }, [onOpenChange]);

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [open, handleEscape]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-surface-950 backdrop-blur-sm animate-fade-in" onClick={() => onOpenChange(false)} />
      <div className={cn("relative w-full max-w-lg rounded-xl border border-surface-700 bg-surface-800 shadow-2xl animate-scale-in", size === "sm" && "max-w-md", size === "lg" && "max-w-2xl", size === "xl" && "max-w-4xl", className)} {...props}>
        {children}
      </div>
    </div>,
    document.body
  );
}

interface ModalHeaderProps extends ComponentPropsWithoutRef<"div"> {
  title: string;
  description?: string;
  onClose?: () => void;
}

export function ModalHeader({ title, description, onClose, className, ...props }: ModalHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between rounded-t-lg p-6", className)} {...props}>
      <div>
        <h3 className="text-lg font-semibold text-surface-100">{title}</h3>
        {description && <p className="mt-1 text-sm text-surface-300">{description}</p>}
      </div>
      {onClose && (
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-lg">
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

interface ModalContentProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode;
}

export function ModalContent({ children, className, ...props }: ModalContentProps) {
  return <div className={cn("px-6 py-4", className)} {...props}>{children}</div>;
}

interface ModalFooterProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode;
  className?: string;
}

export function ModalFooter({ children, className, ...props }: ModalFooterProps) {
  return (
    <div className={cn("flex items-center justify-end gap-2 rounded-b-lg border-t border-surface-700/50 p-4", className)} {...props}>
      {children}
    </div>
  );
}

interface ModalCloseProps {
  children: ReactNode;
}

export function ModalClose({ children }: ModalCloseProps) {
  const { close } = useModal();
  return <>{children}</>;
}