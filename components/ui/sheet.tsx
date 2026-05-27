"use client";

import type React from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type SheetContextValue = {
  open: boolean;
  setOpen: (value: boolean) => void;
};

const SheetContext = createContext<SheetContextValue | null>(null);

function useSheetContext() {
  const context = useContext(SheetContext);
  if (!context) {
    throw new Error("Sheet components must be used within a Sheet");
  }
  return context;
}

export function Sheet({
  open,
  onOpenChange,
  children,
}: React.PropsWithChildren<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}>) {
  const value = useMemo(() => ({ open, setOpen: onOpenChange }), [open, onOpenChange]);

  return <SheetContext.Provider value={value}>{children}</SheetContext.Provider>;
}

export function SheetTrigger({ children }: React.PropsWithChildren) {
  const { setOpen } = useSheetContext();

  return <button type="button" onClick={() => setOpen(true)}>{children}</button>;
}

export function SheetContent({
  side = "right",
  className,
  children,
}: React.PropsWithChildren<{
  side?: "right" | "left";
  className?: string;
}>) {
  const { open, setOpen } = useSheetContext();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("keydown", onKeyDown);
    }

    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, setOpen]);

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-50 bg-slate-950/50 transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setOpen(false)}
      />
      <div
        className={cn(
          "fixed inset-y-0 z-50 w-full max-w-100 bg-white shadow-2xl transition-transform duration-300",
          side === "right" ? "right-0" : "left-0",
          open
            ? "translate-x-0"
            : side === "right"
              ? "translate-x-full"
              : "-translate-x-full",
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
      >
        {children}
      </div>
    </>
  );
}

export function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("border-b border-slate-200 px-5 py-4", className)} {...props} />;
}

export function SheetTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-base font-semibold text-slate-900", className)} {...props} />;
}

export function SheetDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("mt-1 text-sm text-slate-600", className)} {...props} />;
}

export function SheetBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-4 p-5", className)} {...props} />;
}
